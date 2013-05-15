define([
        'sge',
        './config',
        './blocklevelgenerator',
        './physics',
        './factory',
        './map',
        './encounters',
        './megablock'
    ],
    function(sge, config, BlockLevelGenerator, Physics, Factory, Map, encounters, megablock){

        INTRO = "In Mega City One the men and women of the Hall of Justice are the only thing that stand between order and chaos. Jury, judge and executioner these soliders of justice are the physical embodiment of the the law. As a member of this elite group it is your responsiblity to bring justice to Mega City One.";
        INTRO2 = "Rookie you have been assigned to dispense the law in this Mega Block."
    	var DreddRLState = sge.GameState.extend({
    		initState: function(options){
                
                // Tile Map
                this.options = options || {};
                this._contactList = [];
                this._listenersEntity = {};

                this._intro = false;
                this._killList = [];

                this._logMsg = [];
                this._logQueue = [];
                this._logTimer = -1;

                this._track_x = null;
                this._track_y = null;
                this._debug_count = 0;
                this._debugTick = false;
                this._debugCounter = 0.3;
                this._debugEnable = false;

                this._uiContainer = new CAAT.ActorContainer();
                this._gamePlayContainer = new CAAT.ActorContainer();
                this._entityContainer = new CAAT.ActorContainer();
                
                this.scene.addChild(this._gamePlayContainer);
                this.scene.addChild(this._uiContainer);

                this.factory = Factory;

                // Load Game "Plugins"

                //Hash ID to Entity ID
                this._spatialHash = {};
                this._spatialHashReverse = {};
                this._spatialHashWidth = 96; //((this.map.width * 32) / 4);
                this._spatialHashHeight = 96; //((this.map.height * 32) / 4);

                this.loader = new sge.vendor.PxLoader();
                this.loader.addProgressListener(this.progressListener.bind(this));
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future1.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future2.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future3.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future4.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/judge.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albert.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albertbrownhair.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/judge_tint_red.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albert_tint_red.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albertbrownhair_tint_red.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/gang_1.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/gang_2.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/gang_6.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_1.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_2.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_3.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_4.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_5.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_6.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_7.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/women_8.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/scifi_icons_1.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/exclimation_icons.png');
                
                

                /* Bound Events */
                this.pause = function(){
                    this.game.fsm.pause()
                }.bind(this);
                this.input.addListener('keydown:' + config.pauseButton, this.pause);
 
                this.toggleShadows = function(){
                    this.shadows.toggle()
                }.bind(this);

                this.loader.start();
            },

            evalValue : function(path, ctx){
                var _ctx = ctx;
                if (path.match(/^@/)){
                    var name = path.split('.')[0];
                    name = name.replace('@(','').replace(')','');
                    if (name=='state'){
                        _ctx = this;
                    } else {
                        _ctx = this.getEntitiesWithTag(name)[0];
                    }
                    path = path.replace('@(' + name + ').', '');
                }
                return _ctx.get(path);
            },

            _updateUI: function(){
                _.map(this._uiFunctions, function(func){
                    func();
                });
                this._updateLog();
            },

            _createUIItem: function(label, path, options){
                options = sge.util.extend({
                    tx: 16,
                    ty: 16
                },options || {})
                var container = new CAAT.ActorContainer().setLocation(options.tx, options.ty);
                var fontStyle = '24px sans-serif';
                var label = new CAAT.TextActor().setFont(fontStyle).setText(label);
                var valuebox = new CAAT.TextActor().setFont(fontStyle).setText('null');
                var currentVal = null;
                label.calcTextSize(this.game.renderer);
                label.cacheAsBitmap();
                valuebox.setLocation(label.textWidth+4,0);
                valuebox.cacheAsBitmap();
                container.addChild(label);
                container.addChild(valuebox);
                var callback = function(){
                var value = this.evalValue(path);
                    if (currentVal!=value){
                        currentVal = value;
                        valuebox.stopCacheAsBitmap();
                        valuebox.setText('' + value);
                        valuebox.cacheAsBitmap();
                    }
                };
                this._uiFunctions.push(callback.bind(this));
                this._uiContainer.addChild(container);
            },

            initGame : function(){
                var width = 24;
                var height = 24;
                this.physics = new Physics(this);
                this.level = new megablock.MegaBlockLevel(null, this);
                this.physics.setMap(this.map);
                this.scene.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._uiContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._gamePlayContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._entityContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                //Load Game Plugins

                //Setup Interaction System
                this._interaction_actor = new CAAT.Actor().setFillStyle('green').setStrokeStyle('black').setSize(32,32).setVisible(false);
                this.map.dynamicContainer.addChild(this._interaction_actor);
                this.map.dynamicContainer.setZOrder(this._interaction_actor, 0);
                

                //Add PC
                var pc = null;
                if (this.game.data.pc!==undefined){
                    pc = this.game.data.pc;
                } else {
                    var pc = Factory('pc', {
                        xform : {
                            tx: 96,
                            ty: 384,
                        }});
                    pc.tags.push('pc');
                }
                this.addEntity(pc);
                this.pc = pc;

                this.input.addListener('keydown:Q', function(){
                    this.level.encounterSystem.switch();
                }.bind(this));
                setTimeout(function() {
                        this.game.fsm.finishLoad();
                }.bind(this), 1000);
                
                //Add Render Layers
                this._gamePlayContainer.addChild(this.map.container);
                this._gamePlayContainer.addChild(this.map.dynamicContainer);
                this._gamePlayContainer.addChild(this._entityContainer);
                this._gamePlayContainer.addChild(this.map.canopy);



                this.map.render();

                //Create UI;
                this._uiFunctions = [];
                this._createUIItem('XP:', '@(pc).stats.xp');
                this._createUIItem('AMMO:', '@(pc).inventory.ammo', {ty: 40});
                this._createUIItem('HEALTH:', '@(pc).health.life', {ty: 64});
                this._createUIItem('LEVEL:', '@(pc).stats.level', {tx: 96});

                this._logs = [];
                this._cachedLogLength = this._logs.length;
                this._logContainer = new CAAT.ActorContainer();
                this._logContainer.setLocation(16,this.game.renderer.height - 80);
                this.logActors = [];
                var fontSize = 16;
                this.logActors[0] = new CAAT.TextActor().setFont( fontSize + 'px sans-serif').setLocation(0,0);
                this._logContainer.addChild(this.logActors[0]);
                this.logActors[1] = new CAAT.TextActor().setFont( fontSize + 'px sans-serif').setLocation(0,16).setAlpha(0.75);
                this._logContainer.addChild(this.logActors[1]);
                this.logActors[2] = new CAAT.TextActor().setFont( fontSize + 'px sans-serif').setLocation(0,32).setAlpha(0.5);
                this._logContainer.addChild(this.logActors[2]);
                this.logActors[3] = new CAAT.TextActor().setFont( fontSize + 'px sans-serif').setLocation(0,48).setAlpha(0.25);
                this._logContainer.addChild(this.logActors[3]);
                this._uiContainer.addChild(this._logContainer);

                this._dialogContainer = new CAAT.ActorContainer().setLocation(16,16).setVisible(false);
                this._dialogActor = new CAAT.TextActor().setFont(fontSize + 'px sans-serif').setText('TEST!');
                this._dialogContainer.addChild(this._dialogActor);
                this._uiContainer.addChild(this._dialogContainer);
                this.log('You are the Law.');
            },

            newLevel : function(options){
                this.game.fsm.startLoad();
                options = options || {};
                this.game.data.pc = this.pc;
                this.removeEntity(this.pc);
                this.game._states['game'] = new this.game._gameState(this.game, 'Game');
                this.game._states['game'].loader.start();
            },

            progressListener : function(e){
                var subpath = e.resource.getName().split('/');
                var name = subpath[subpath.length-1].split('.')[0];
                var spriteSize = 32;
                if (name.match(/icons/)){
                    spriteSize = 24;
                }
                //console.log(name, e.resource.img.height / spriteSize, e.resource.img.width / spriteSize)
                sge.Renderer.SPRITESHEETS[name] = new CAAT.SpriteImage().initialize(e.resource.img, e.resource.img.height / spriteSize, e.resource.img.width / spriteSize);
                if (e.completedCount == e.totalCount){
                    this.initGame();
                }
            },

            addEntity: function(entity){
                this._super(entity);
                var funcs = [];
                funcs.push(entity.addListener('kill', function(){
                    entity.active = false;
                    this._killList.push(entity);
                }.bind(this)));
                funcs.push(entity.addListener('log', function(msg){
                    this.logCallback(msg);
                }.bind(this)));
                funcs.push(entity.addListener('xform.move', function(){
                    this._updateHash(entity);
                }.bind(this)));
                funcs.push(entity.addListener('xform.update', function(){
                    if (!_.contains(this.physics.dirty, entity)){
                        this.physics.dirty.push(entity);
                    }
                }.bind(this)));
                this._updateHash(entity);
                this._listenersEntity[entity] = funcs;
                if (entity.get('physics')!==undefined){
                    this.physics.dirty.push(entity);
                }
            },

            removeEntity: function(entity){
                _.each(this._listenersEntity[entity], function(f){
                    entity.removeListener(f);
                });
                return this._super(entity);
            },

            logCallback : function(msg){
                this.log(msg);
            },

            log : function(msg){
                this._logs.push(msg);
            },

            _updateLog : function(){
                if (this._cachedLogLength!=this._logs.length){
                    this._logContainer.stopCacheAsBitmap();
                    this._cachedLogLength = this._logs.length;
                    var msgs = this._logs.slice(-4);
                    msgs.reverse();
                    _.each(msgs, function(msg, i){
                        this.logActors[i].setText(msg);
                    }.bind(this));
                    this._logContainer.cacheAsBitmap();
                }
            },

            _removeFromHash : function(entity){
                var hash = this._spatialHashReverse[entity.id];
                this._spatialHashReverse[entity.id]=undefined;
                this._spatialHash[hash] = _.without(this._spatialHash[hash], entity.id);
            
            },

            _updateHash : function(entity){
                var tx = Math.floor(entity.get('xform.tx') / 32);
                var ty = Math.floor(entity.get('xform.ty') / 32);
                /*
                var oldTile = entity.get('xform.tile');
                var tile = this.map.getTile(tx, ty);
                if (oldTile!=tile){
                    if (oldTile){
                        oldTile.entities = _.without(oldTile.entities, entity);
                    }
                    tile.entities.push(entity);
                    tile.update();
                }
                entity.set('xform.tile', tile);
                */
                var cx = Math.floor(entity.get('xform.tx') / this._spatialHashWidth);
                var cy = Math.floor(entity.get('xform.ty') / this._spatialHashHeight);
                var hash = cx + '.' + cy;
                if (this._spatialHashReverse[entity.id]!=hash){
                    if (this._spatialHashReverse[entity.id]!==undefined){
                        this._removeFromHash(entity);
                    }
                    if (this._spatialHash[hash]==undefined){
                        this._spatialHash[hash]=[];
                    }
                    this._spatialHash[hash].push(entity.id);
                    this._spatialHashReverse[entity.id] = hash;
                }     
            },
            
            findEntities : function(tx, ty, radius){
                var entities = [];
                var cx = Math.floor(tx / this._spatialHashWidth);
                var cy = Math.floor(ty / this._spatialHashHeight);
                delta = [[-1, -1], [0, -1], [1, -1],[-1, 0], [0, 0], [1, 0],[-1, 1], [0, 1], [1, 1]];
                for (var i = delta.length - 1; i >= 0; i--) {
                    var hash = (cx + delta[i][0]) + '.' + (cy + delta[i][1]);
                    var ids = this._spatialHash[hash];
                     _.each(ids, function(id){
                        var entity = this.getEntity(id);
                        var ex = entity.get('xform.tx') - tx;
                        var ey = entity.get('xform.ty') - ty;
                        if (((ex*ex)+(ey*ey)) <= (radius*radius)){
                            entities.push(entity);
                        }
                    }.bind(this));
                };
                return entities;
            },

            _interaction_tick : function(delta){
                var closest = null;
                var cdist = 128*128;
                var ccord = null;
                var pcHash = this._spatialHashReverse[this.pc.id];
                var pcTx = this.pc.get('xform.tx');
                var pcTy = this.pc.get('xform.ty')
                var entities = this.findEntities(pcTx, pcTy, 128)
                for (var i = entities.length - 1; i >= 0; i--) {
                    entity = entities[i];
                    if (entity.get('interact')==undefined){
                        continue;
                    }
                    if (entity==this.pc){
                        continue;
                    }
                    if (entity.get('interact.targets')!==null){
                        coords = entity.get('interact.targets');
                    } else {
                        coords = [[entity.get('xform.tx'), entity.get('xform.ty')]];
                    }
                    for (var j = coords.length - 1; j >= 0; j--) {
                        var dx = coords[j][0] - pcTx;
                        var dy = coords[j][1] - pcTy;
                        var distSqr = (dx*dx)+(dy*dy);
                        if (distSqr <= (entity.get('interact.dist') * entity.get('interact.dist'))){
                            if (distSqr < cdist){
                                closest = entity;
                                cdist = distSqr;
                                ccord = coords[j];
                            }
                        }
                    };
                    
                }
                if (closest!=this._closest){
                    if (this._closest){
                        this._closest.fireEvent('focus.lose');
                        this._interaction_actor.setVisible(false);
                    }
                    if (closest){
                        closest.fireEvent('focus.gain', ccord);
                        this._interaction_actor.setLocation(ccord[0],ccord[1]);
                        this._interaction_actor.setVisible(true);
                    }
                    this._closest = closest;
                }
                if (closest!=null){
                    this._interaction_actor.setLocation(ccord[0],ccord[1]);
                }
            },

            startDialog: function(dialog){
                this.game._states['dialog'].setDialog(dialog);
                this.game.fsm.startDialog();
            },

            tick : function(delta){
                this._debugCounter -= delta;
                if (this._debugCounter <= 0 && this._debugEnable==true){
                    this._debugTick = true;
                    this._debugCounter = 0.3;
                } else {
                    this._debugTick = false;
                }
                var debugTime = Date.now();
                this.tickTimeouts(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Timeout Time:', t-debugTime); debugTime=t};
                this.physics.resolveCollisions(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Physics Time:', t-debugTime); debugTime=t};

                if (!this.game.data._intro){
                    this.game.data._intro = true;
                    this.startDialog(INTRO);
                }
                
                //Update Interaction System
                this._interaction_tick(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Interaction Time:', t-debugTime); debugTime=t};
                
                //Update Component System
                for (var i = this._entity_ids.length - 1; i >= 0; i--) {
                    //var c = Date.now();
                    this.entities[this._entity_ids[i]].tick(delta);
                    //if (this._debugTick){ var t=Date.now(); console.log('Time:', i, t-c);};
                };
                if (this._debugTick){ var t=Date.now(); console.log('Component Time:', t-debugTime, this._entity_ids.length); debugTime=t};
                
                //Prune entities
                _.each(this._killList, function(e){
                    this._removeFromHash(e);
                    this.removeEntity(e);
                }.bind(this));
                //if (this._debugTick){ var t=Date.now(); console.log('Kill Time:', t-debugTime); debugTime=t};
                
                //Tick Encounter System
                this.level.tick(delta);
                //if (this._debugTick){ var t=Date.now(); console.log('Encounter Time:', t-debugTime); debugTime=t};
                
                //Track Player
                var tx = this.pc.get('xform.tx');
                var ty = this.pc.get('xform.ty');
                this._gamePlayContainer.setLocation(-tx+(this.game.renderer.width/2),-ty+(this.game.renderer.height/2));

                //Update Log
                this._updateUI();
                if (this._debugTick){ var t=Date.now(); console.log('Update Scene Time:', t-debugTime); debugTime=t};

                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    var tx = entity.get('xform.tx');
                    var ty = entity.get('xform.ty');
                    var tile = this.map.getTile(Math.floor(tx / 32), Math.floor(ty / 32));
                    if (tile){
                        if (tile.fade<1){
                            entity.componentCall('render', this.game.renderer, 'main');
                        }
                    }
                }.bind(this));
                if (this._debugTick){ var t=Date.now(); console.log('Render Time:', t-debugTime); debugTime=t};
                //if (this._debugTick){ var t=Date.now(); console.log('Tick Time:', t-debugTime); debugTime=t};
            },
            
            _paused_tick : function(delta){
                //this.game.renderer.track(this.pc);
                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    entity.componentCall('render', this.game.renderer, 'main');
                }.bind(this))
            },
    	})

    	return DreddRLState;
    }
)

define([
        'sge',
        './config',
        './loader',
        './blocklevelgenerator',
        './physics',
        './factory',
        './map',
        './megablock',
        './weapon',
        './item'
    ],
    function(sge, config, Loader, BlockLevelGenerator, Physics, Factory, Map, megablock, Weapon, Item){

        INTRO = "In Mega City One the men and women of the Hall of Justice are the only thing that stand between order and chaos. Jury, judge and executioner these soliders of justice are the physical embodiment of the the law. As a member of this elite group it is your responsiblity to bring justice to Mega City One.";
        INTRO2 = "Rookie you have been assigned to dispense the law in this Mega Block."
    	
        var HashTable = sge.Class.extend({
            init: function(){
                this._table = {};
                this._reverseTable = {};
            },
            add: function(key, item){
                if (this._table[key]===undefined){
                    this._table[key]=[];
                }
                if (!_.contains(this._table[key], item)){
                    this._table[key].push(item);
                    if (this._reverseTable[item]===undefined){
                        this._reverseTable[item] = [];
                    }
                    this._reverseTable[item].push(key);
                }
            },
            get: function(key){
                return this._table[key];
            },
            reverseGet : function(item){
                if (this._reverseTable[item]===undefined){
                    this._reverseTable[item] = [];
                }
                return this._reverseTable[item]
            },
            remove: function(key, item){
                this._table[key] = _.without(this._table[key], item);
                this._reverseTable[item] = _.without(this._reverseTable[item], key);
            }

        });

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

                this._msgs = []

                this._track_x = null;
                this._track_y = null;
                this._debug_count = 0;
                this._debugTick = false;
                this._debugCounter = 0.3;
                this._debugEnable = false;

                this._uiContainer = new CAAT.ActorContainer();
                this._gamePlayContainer = new CAAT.ActorContainer();
                this._entityContainer = new CAAT.ActorContainer();

                this._activeActions = [];
                
                this.scene.addChild(this._gamePlayContainer);
                this.scene.addChild(this._uiContainer);


                //Create UI;
                this._uiFunctions = [];
                this._createUIItem('XP:', '@(pc).stats.xp');
                this._createUIItem('AMMO:', '@(pc).inventory.ammo', {ty: 40});
                this._createUIItem('HEALTH:', '@(pc).health.life', {ty: 64});
                this._createUIItem('KEYS:', '@(pc).inventory.keys', {ty: 96});
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

                this.infoContainer = new CAAT.ActorContainer().setLocation(this.game.renderer.width/3, this.game.renderer.height-96);
                this.infoActor = new CAAT.TextActor().setFont( fontSize + 'px sans-serif').setLocation(16,16).setAlpha(1);
                this.infoActor.setText('Some Info Message Goes Here').setVisible(false);
                this.infoContainer.addChild(this.infoActor);
                this._uiContainer.addChild(this.infoContainer);


                this._dialogContainer = new CAAT.ActorContainer().setLocation(16,16).setVisible(false);
                this._dialogActor = new CAAT.TextActor().setFont(fontSize + 'px sans-serif').setText('TEST!');
                this._dialogContainer.addChild(this._dialogActor);
                this._uiContainer.addChild(this._dialogContainer);

                this.factory = Factory;

                // Load Game "Plugins"

                //Hash ID to Entity ID
                this._spatialHash = {};
                this._spatialHashReverse = {};
                this._spatialHashWidth = 32; //((this.map.width * 32) / 4);
                this._spatialHashHeight = 32; //((this.map.height * 32) / 4);

                this._spatialHashRegions = {};
                this._spatialHashRegionsReverse = {};

                this._regionEntityHash = new HashTable();

                
                

                /* Bound Events */
                this.pause = function(){
                    this.game.fsm.pause()
                }.bind(this);
                this.input.addListener('keydown:' + config.pauseButton, this.pause);
 
                this.toggleShadows = function(){
                    this.shadows.toggle()
                }.bind(this);

                this.loader = new Loader(this.game);
                this.loader.loadAssets('/content/demo.json').then(this.initGame.bind(this));
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
                if (this.game.data.megablock==undefined){
                    console.log('Creating MegaBlock!')
                    this.game.data.megablock = new megablock.MegaBlock();
                }
                this.level = this.game.data.megablock.getCurrentLevel(this);
                this.map = this.level.map;
                
                this.physics.setMap(this.map);

                this.scene.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._uiContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._gamePlayContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                this._entityContainer.setBounds(0,0,this.level.width*32+16,this.level.height*32+16);
                //Load Game Plugins

                //Setup Interaction System
                this._interaction_actor = new CAAT.Actor().setFillStyle('lime').setStrokeStyle('black').setSize(32,32).setVisible(false);
                this.map.highlightContainer.addChild(this._interaction_actor);
                this.map.highlightContainer.setZOrder(this._interaction_actor, 0);

                //Add PC

                var pc = null;
                if (this.game.data.pc!==undefined){
                    pc = this.game.data.pc;
                } else {
                    var pc = Factory('pc', {
                        xform : {
                            tx: this.level.startLocation.tx || 96,
                            ty: this.level.startLocation.ty || 384,
                        }
                    });
                    pc.tags.push('pc');

                }
                this.addEntity(pc);

                this.pc = pc;
                this.pc.addListener('entity.kill', function(){
                    this.game.fsm.gameOver();
                }.bind(this));
                this.input.addListener('keydown:Q', function(){
                    
                //TODO: Switch Quest Toggle
                //this.level.encounterSystem.switch();
                }.bind(this));
                setTimeout(function() {
                        this.game.fsm.finishLoad();
                }.bind(this), 1000);
                
                //Add Render Layers
                this._gamePlayContainer.addChild(this.map.baseContainer);
                this._gamePlayContainer.addChild(this.map.highlightContainer);
                this._gamePlayContainer.addChild(this.map.container);
                this._gamePlayContainer.addChild(this.map.dynamicContainer);
                this._gamePlayContainer.addChild(this._entityContainer);
                this._gamePlayContainer.addChild(this.map.canopy);
                this.level.setup();
                this.map.render();
                this._updateUI();
                this.log('You are the Law.');
            },

            nextLevel : function(up){
                if (up){
                    console.log('Going Up?', this.game.data.megablock.level);
                    if (this.game.data.megablock.level>=this.game.data.megablock.levels.length-1){
                        return false;
                    } else {
                       this.game.data.megablock.level=this.game.data.megablock.level+1; 
                    }
                } else {
                    if (this.game.data.megablock.level==0){
                        return false;
                    } else {
                       this.game.data.megablock.level=this.game.data.megablock.level-1; 
                    }
                }
                this.game.fsm.startLoad();
                this.game.data.pc = this.pc;
                console.log('Loading Level', this.game.data.megablock.level)
                this.removeEntity(this.pc);
                this.game._states['game'] = new this.game._gameState(this.game, 'Game');
                
            },

            createEntity: function(type, options){
                var entity = Factory(type, options);
                return entity;
            },

            addEntity: function(entity){
                this._super(entity);
                
                var funcs = [];
                funcs.push(entity.addListener('entity.kill', function(){
                    entity.active = false;
                    this._killList.push(entity);
                }.bind(this)));
                funcs.push(entity.addListener('state.log', function(msg){
                    this.logCallback(msg);
                }.bind(this)));
                funcs.push(entity.addListener('state.info', function(msg){
                    this.info(msg);
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

            info : function(msg){
                this._msgs.push(msg);
                if (this._infoTimeout==null){
                    this._infoNext();
                };
            },

            _infoNext: function(){
                if (this._msgs.length){
                    msg = this._msgs.shift();
                    this.infoActor.setText(msg).setVisible(true);
                    this._infoTimeout = this.createTimeout(2, this._infoNext.bind(this));
                } else {
                    this.infoActor.setVisible(false);
                    this._infoTimeout = null;
                }
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
                    this._updateRegion(entity, hash);
        
                } 
            },

            _updateRegion : function(entity, hash){
                var origRegions = this._regionEntityHash.reverseGet(entity.id);
                var tx = entity.get('xform.tx');
                var ty = entity.get('xform.ty');
                //Remove old regions.
                var pruned = _.filter(origRegions, function(region){
                    if ((tx>region.data.left&&tx<region.data.right)&&(ty>region.data.top&&ty<region.data.bottom)){
                        return true;
                    } else {
                        this._regionEntityHash.remove(region, entity.id);
                        entity.fireEvent('region.exit', region);
                        region.entities = _.without(region.entities, entity);
                        entity._regions = _.without(entity._regions, region);
                        region.onRegionExit(entity);
                        return false;
                    }
                }.bind(this));
                newRegions = this._spatialHashRegionsReverse[hash] || [];
                 _.each(newRegions, function(region){
                    if (!_.contains(pruned, region)){
                        if ((tx>region.data.left&&tx<region.data.right)&&(ty>region.data.top&&ty<region.data.bottom)){
                            this._regionEntityHash.add(region, entity.id);
                            entity.fireEvent('region.enter', region);
                            region.entities.push(entity);
                            entity._regions.push(region);
                            region.onRegionEnter(entity);
                        }
                    }
                }.bind(this));
            },
            
            _addRegion : function(region){
                this._spatialHashRegions[region] = [];
                for (var j = region.data.top; j <= region.data.bottom+this._spatialHashHeight; j+=this._spatialHashHeight){
                    if (j>region.data.bottom){
                        j = region.data.bottom;
                    }
                    for (var i = region.data.left; i <= region.data.right+this._spatialHashWidth; i+=this._spatialHashWidth) {
                        if (i>region.data.right){
                            i = region.data.right;
                        }
                        var cx = Math.floor(i / this._spatialHashWidth);
                        var cy = Math.floor(j / this._spatialHashHeight);
                        var hash = cx + '.' + cy;
                        if (!_.contains(this._spatialHashRegions[region], hash)){
                            this._spatialHashRegions[region].push(hash);
                            if (this._spatialHashRegionsReverse[hash]===undefined){
                                this._spatialHashRegionsReverse[hash]=[];
                            };
                            this._spatialHashRegionsReverse[hash].push(region);
                        }
                        if (i>=region.data.right){
                            break;
                        }
                    }
                    if(j>=region.data.bottom){
                        break;
                    }
                }
            },

            findEntities : function(tx, ty, radius){
                var entities = [];
                var cx = Math.floor(tx / this._spatialHashWidth);
                var cy = Math.floor(ty / this._spatialHashHeight);
                var rad = Math.ceil(radius / 32);
                delta = [[-1, -1], [0, -1], [1, -1],[-1, 0], [0, 0], [1, 0],[-1, 1], [0, 1], [1, 1]];
                for (var j = -rad; j<=rad; j++)
                    for (var i = -rad; i <= rad; i++) {
                        var hash = ((cx + i) + '.' + (cy + j));
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
                    if (!entity.get('interact.enabled')){
                        continue
                    }
                    if (entity==this.pc){
                        continue;
                    }
                    if (entity.get('interact.targets')!==null){
                        coords = entity.get('interact.targets').map(function(target){
                            return [entity.get('xform.tx')+target[0], entity.get('xform.ty')+target[1]]
                        });
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
                    }
                    if (closest){
                        closest.fireEvent('focus.gain', ccord);
                    }
                    this._closest = closest;
                }
                if (closest!=null){
                    
                    //this._interaction_actor.setLocation(ccord[0]+closest.get('xform.offsetX'),ccord[1]+closest.get('xform.offsetY'));
                }
            },

            startDialog: function(dialog, context){
                this.game._states['dialog'].setDialog(dialog, context);
                this.game.fsm.startDialog();
            },

            startCutscene: function(cutscene){
                this.game.fsm.startCutscene();
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
                    //this.startDialog(INTRO);
                    //this.startCutscene();
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
                
                //Update Action System
                var actions = this._activeActions.slice();
                for (var i = actions.length - 1; i >= 0; i--) {
                    actions[i].tick(delta);
                };

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
                this.setCameraLocation(tx, ty);

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
            setCameraLocation: function(tx, ty){
                this._gamePlayContainer.setLocation(-tx+(this.game.renderer.width/2),-ty+(this.game.renderer.height/2));
            },
            getCameraLocation: function(){
                camX = -this._gamePlayContainer.x+(this.game.renderer.width/2);
                camY = -this._gamePlayContainer.y+(this.game.renderer.height/2);
                return [camX,camY];
            },
            
            _paused_tick : function(delta){

                //Track Player
                var tx = this.pc.get('xform.tx');
                var ty = this.pc.get('xform.ty');
                //this._gamePlayContainer.setLocation(-tx+(this.game.renderer.width/2),-ty+(this.game.renderer.height/2));


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

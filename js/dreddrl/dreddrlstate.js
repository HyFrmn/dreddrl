define([
        'sge',
        './blocklevelgenerator',
        './physics',
        './factory',
        './map',
        './encounters',
    ],
    function(sge, BlockLevelGenerator, Physics, Factory, Map, encounters){

        INTRO = "In Mega City One the men and women of the Hall of Justice are the only thing that stand between order and chaos. Jury, judge and executioner these soliders of justice are the physical embodiment of the the law. As a member of this elite group it is you responsiblity to bring justice to Mega City One.";
        INTRO2 = "Rookie you have been assigned to dispense the law in this Mega Block."
    	var DreddRLState = sge.GameState.extend({
    		initState: function(options){
                this.scene.setBounds(0,0,2048,2048);
                // Tile Map
                this.options = options || {};
                this._contactList = [];

                this._intro = true;
                this._killList = [];

                this._logMsg = [];
                this._logQueue = [];
                this._logTimer = -1;

                this._track_x = null;
                this._track_y = null;
                this._debug_count = 0;
                this._debugTick = false;



                this.factory = Factory;
                this.map = new Map(65,66,{src: ['assets/tiles/future1.png', 'assets/tiles/future2.png','assets/tiles/future3.png','assets/tiles/future4.png']});
                this.map.defaultSheet = 'future2';
                // Load Game "Plugins"

                //Hash ID to Entity ID
                this._spatialHash = {};
                this._spatialHashReverse = {};
                this._spatialHashWidth = ((this.map.width * 32) / 4);
                this._spatialHashHeight = ((this.map.height * 32) / 4);

                this.loader = new sge.vendor.PxLoader();
                this.loader.addProgressListener(this.progressListener.bind(this));
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future1.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future2.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future3.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future4.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/judge.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/hunk.png');
                this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albert.png');
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
                
                

                /* Bound Events */
                this.pause = function(){
                    this.game.fsm.pause()
                }.bind(this);
                this.input.addListener('keydown:space', this.pause);

                this.toggleShadows = function(){
                    this.shadows.toggle()
                }.bind(this);

                this.loader.start();
            },

            initGame : function(){
                //Load Game Plugins
                this.physics = new Physics(this);
                this.map.setup(this.scene);
                this._interaction_actor = new CAAT.Actor().setFillStyle('green').setStrokeStyle('black').setSize(32,32).setVisible(false);
                this.scene.addChild(this._interaction_actor);
                this.level = new BlockLevelGenerator(this, this.options);
                pc = Factory('pc', {
                    xform : {
                        tx: 96,
                        ty: 384,
                    }});
                pc.tags.push('pc');
                pc.addListener('kill', function(){
                    this.state._killList.push(pc);
                }.bind(pc));
                this.addEntity(pc);
                this.pc = pc;
                //this.encounterSystem = new encounters.EncounterSystem(this);
                
                //this.encounterSystem.create(encounters.CheckupEncounter);
                //this.encounterSystem.create(encounters.ExecuteEncounter);
                this.map.render();
                this.input.addListener('keydown:Q', function(){
                    this.encounterSystem.switch();
                }.bind(this));
                setTimeout(function() {
                        this.game.fsm.finishLoad();
                }.bind(this), 1000);
                this.map.render(this.game.renderer);
            },

            progressListener : function(e){
                var subpath = e.resource.getName().split('/');
                var name = subpath[subpath.length-1].split('.')[0];
                var spriteSize = 32;
                if (name.match(/icons/)){
                    spriteSize = 24;
                }
                console.log(name, e.resource.img.height / spriteSize, e.resource.img.width / spriteSize)
                sge.Renderer.SPRITESHEETS[name] = new CAAT.SpriteImage().initialize(e.resource.img, e.resource.img.height / spriteSize, e.resource.img.width / spriteSize);
                if (e.completedCount == e.totalCount){
                    this.initGame();
                }
            },
            /*
            startState : function(){
                
                //this.input.addListener('keydown:F', this.toggleShadows);
            },
            endState : function(){
                this.input.removeListener('keydown:space', this.pause)
                //this.input.removeListener('keydown:F', this.toggleShadows)        
            },
            */
            addEntity: function(entity){
                this._super(entity);
                entity.addListener('kill', function(){
                        this._killList.push(entity);
                }.bind(this));
                entity.addListener('log', function(msg){
                    this.logCallback(msg);
                }.bind(this));
                entity.addListener('xform.move', function(){
                    this._updateHash(entity);
                }.bind(this));
                this._updateHash(entity);
            },
            logCallback : function(msg){
                this.log(msg);
            },
            log : function(msg){
                var elem = $('<p/>').text(msg);
                //this._elem_log.prepend($('<li/>').append(elem));
            },
            _removeFromHash : function(entity){
                var hash = this._spatialHashReverse[entity.id];
                    this._spatialHashReverse[entity.id]=undefined;
                    this._spatialHash[hash] = _.without(this._spatialHash[hash], entity.id);
            },
            _updateHash : function(entity){
                var cx = Math.floor(entity.get('xform.tx') / this._spatialHashWidth);
                var cy = Math.floor(entity.get('xform.ty') / this._spatialHashHeight);
                if (this._spatialHashReverse[entity.id]!==undefined){
                    this._removeFromHash(entity);
                }
                var hash = cx + '.' + cy;
                if (this._spatialHash[hash]==undefined){
                    this._spatialHash[hash]=[];
                }
                this._spatialHash[hash].push(entity.id);
                this._spatialHashReverse[entity.id] = hash;
            },
            _interaction_tick : function(delta){
                var closest = null;
                var cdist = 64;
                var ccord = null;
                var pcHash = this._spatialHashReverse[this.pc.id];
                var entities = _.map(this._spatialHash[pcHash], function(id){
                    return this.getEntity(id);
                }.bind(this))
                if (this._debugTick) console.log('Interact', entities);
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
                        var dx = coords[j][0] - this.pc.get('xform.tx');
                        var dy = coords[j][1] - this.pc.get('xform.ty');
                        var dist = Math.sqrt((dx*dx)+(dy*dy));
                        if (dist <= entity.get('interact.dist')){
                            if (dist < cdist){
                                closest = entity;
                                cdist = dist;
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
            },
            startDialog: function(dialog){
                this.game._states['dialog'].setDialog(dialog);
                this.game.fsm.startDialog();
            },
            tick : function(delta){
                this._debugTick = this.game.engine._debugTick;
                var debugTime = Date.now();
                this.tickTimeouts(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Timeout Time:', t-debugTime); debugTime=t};
                this.physics.resolveCollisions(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Physics Time:', t-debugTime); debugTime=t};


                /*
                if (this._intro==false){
                    this._intro = true;
                    this.startDialog(INTRO)
                }
                */
                
                //Update Interaction System
                this._interaction_tick(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Interaction Time:', t-debugTime); debugTime=t};
                //Update Component System
                for (var i = this._entity_ids.length - 1; i >= 0; i--) {
                    //var c = Date.now();
                    this.entities[this._entity_ids[i]].componentCall('tick', delta);
                    //if (this._debugTick){ var t=Date.now(); console.log('Time:', i, t-c);};
                };
                if (this._debugTick){ var t=Date.now(); console.log('Component Time:', t-debugTime, this._entity_ids.length); debugTime=t};
                //Prune entities
                _.each(this._killList, function(e){
                    this._removeFromHash(e);
                    this.removeEntity(e);
                }.bind(this));
                if (this._debugTick){ var t=Date.now(); console.log('Kill Time:', t-debugTime); debugTime=t};
                //Tick Encounter System
                //this.encounterSystem.tick(delta);
                if (this._debugTick){ var t=Date.now(); console.log('Encounter Time:', t-debugTime); debugTime=t};
                //this.game.renderer.track(this.pc);
                var tx = this.pc.get('xform.tx');
                var ty = this.pc.get('xform.ty');
                this.scene.setLocation(-tx+320,-ty+240);
                //this.shadows.tick(this.pc.get('xform.tx'),this.pc.get('xform.ty'));
                if (this._debugTick){ var t=Date.now(); console.log('Scene Time:', t-debugTime); debugTime=t};

                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    var tx = entity.get('xform.tx');
                    var ty = entity.get('xform.ty');
                    var tile = this.map.getTile(Math.floor(tx / 32), Math.floor(ty / 32));
                    if (tile.fade<1||true){
                        entity.componentCall('render', this.game.renderer, 'main');
                    }
                }.bind(this));
                if (this._debugTick){ var t=Date.now(); console.log('Render Time:', t-debugTime); debugTime=t};
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
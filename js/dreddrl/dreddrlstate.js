define([
        'sge',
        './blocklevelgenerator',
        './physics',
        './factory',
        './map'
    ],
    function(sge, BlockLevelGenerator, Physics, Factory, Map){

        INTRO = "In Mega City One the men and women of the Hall of Justice are the only thing that stand between order and chaos. Jury, judge and executioner these soliders of justice are the physical embodiment of the the law. As a member of this elite group it is you responsiblity to bring justice to Mega City One.";
        INTRO2 = "Rookie you have been assigned to dispense the law in this Mega Block."
    	var DreddRLState = sge.GameState.extend({
    		initState: function(options){
                // Tile Map
                this.options = options || {};
                this._contactList = [];

                this._intro = false;
                this._killList = [];

                this._logMsg = [];
                this._logQueue = [];
                this._logTimer = -1;

                this._track_x = null;
                this._track_y = null;
                this._debug_count = 0;
                this._debug_tick = false;


                this.factory = Factory;
                this.initUi();
                this.map = new Map(65,66,{src: ['assets/tiles/future1.png', 'assets/tiles/future2.png','assets/tiles/future3.png','assets/tiles/future4.png']});
                this.map.defaultSheet = 'future2';
                this.game.renderer.createLayer('base');
                this.game.renderer.createLayer('main');
                this.game.renderer.createLayer('canopy');
                // Load Game "Plugins"
                this.physics = new Physics(this);
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
                this.level = new BlockLevelGenerator(this, this.options);
                setTimeout(function() {
                        this.game.fsm.finishLoad();
                }.bind(this), 1000);
                this.map.render(this.game.renderer);
            },

            progressListener : function(e){
                sge.SpriteSheet.SpriteSheetImages[e.resource.getName()] = e.resource.img;
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
                entity.addListener('target.set', function(){
                    this._target_entity = entity;
                }.bind(this));
            },
            initUi : function(){
                this._elem_ammo = $('span.ammo');
                this._elem_health = $('span.health');
                this._elem_xp = $('span.xp');
                this._elem_log = $('ul.log');
            },
            updateUi : function(){
                if (this.pc){
                    this._elem_ammo.text(this.pc.get('inventory.ammo'));
                    this._elem_health.text(this.pc.get('health.life'));
                    this._elem_xp.text(this.pc.get('stats.xp'));
                }
            },
            logCallback : function(msg){
                this.log(msg);
            },
            log : function(msg){
                var elem = $('<p/>').text(msg);
                this._elem_log.prepend($('<li/>').append(elem));
            },
            _quest_tick : function(delta){
                function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
                    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                    if (isNaN(x)||isNaN(y)) {
                        return false;
                    } else {
                        if (x1>=x2) {
                            if (!(x2<=x&&x<=x1)) {return false;}
                        } else {
                            if (!(x1<=x&&x<=x2)) {return false;}
                        }
                        if (y1>=y2) {
                            if (!(y2<=y&&y<=y1)) {return false;}
                        } else {
                            if (!(y1<=y&&y<=y2)) {return false;}
                        }
                        if (x3>=x4) {
                            if (!(x4<=x&&x<=x3)) {return false;}
                        } else {
                            if (!(x3<=x&&x<=x4)) {return false;}
                        }
                        if (y3>=y4) {
                            if (!(y4<=y&&y<=y3)) {return false;}
                        } else {
                            if (!(y3<=y&&y<=y4)) {return false;}
                        }
                    }
                    return [x,y];
                }

                var entity = this._target_entity;
                if (entity){
                    coord = [entity.get('xform.tx'), entity.get('xform.ty')];
                    var dx = coord[0] - this.pc.get('xform.tx');
                    var dy = coord[1] - this.pc.get('xform.ty');
                    var dist = Math.sqrt((dx*dx)+(dy*dy));
                    var len = 640; //Math.min(dist, 640);
                    var x1 = (this.pc.get('xform.tx') - this.game.renderer.tx);
                    var y1 = (this.pc.get('xform.ty') - this.game.renderer.ty); 
                    var x2 = (dx + this.pc.get('xform.tx')) - this.game.renderer.tx;
                    var y2 = (dy + this.pc.get('xform.ty')) - this.game.renderer.ty;
                    var top = 32;
                    var bottom = 448;
                    var left = 32;
                    var right = 608;
                    coords = [[left,top,right,top],[left,bottom,right,bottom],[left,top,left,bottom],[right,top,right,bottom]];
                    var intersection = false;
                    for (var i = coords.length - 1; i >= 0; i--) {
                        var coord = coords[i];
                        if (this._debug_tick){
                            console.log(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
                        }
                        intersection = lineIntersect(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
                        if (intersection){
                            console.log(intersection);
                            break;
                        }
                    }; 
                    if (intersection){
                        tx = intersection[0] + this.game.renderer.tx;
                        ty = intersection[1] + this.game.renderer.ty;
                    } else {
                        tx =  entity.get('xform.tx');
                        ty =  entity.get('xform.ty');
                    }

                    this.game.renderer.drawRect('canopy', tx-4, ty-4, 8, 8, {fillStyle: 'yellow'}, 1000000);
                }
            },
            _interaction_tick : function(delta){
                var closest = null;
                var cdist = 64;
                var ccord = null;
                var entities = this.getEntitiesWithComponent('interact');
                
                for (var i = entities.length - 1; i >= 0; i--) {
                    entity = entities[i];
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
                    }
                    if (closest){
                        closest.fireEvent('focus.gain', ccord);
                    }
                    this._closest = closest;
                }
            },
            startDialog: function(dialog){
                this.game._states['dialog'].setDialog(dialog);
                this.game.fsm.startDialog();
            },
            tick : function(delta){
                this._debug_count++;
                if (this._debug_count>30){
                    this._debug_count = 0;
                    this._debug_tick = true;
                } else {
                    this._debug_tick = false
                }
                this.tickTimeouts(delta);
                this.physics.resolveCollisions(delta);
                if (this._intro==false){
                    this._intro = true;
                    this.startDialog(INTRO)
                }
                this._interaction_tick(delta);
                this._quest_tick(delta);
                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    entity.componentCall('tick', delta);
                }.bind(this));
                _.each(this._killList, function(e){
                    this.removeEntity(e);
                }.bind(this))

                if (this.getEntitiesWithTag('pc').length<=0){
                    this.game.fsm.gameOver();
                }

                if (_.every(this.level.encounters, function(e){return e.isFinished()})){
                    this.game.fsm.gameWin();
                }

                this.game.renderer.track(this.pc);
                //this.shadows.tick(this.pc.get('xform.tx'),this.pc.get('xform.ty'));
                this.map.render(this.game.renderer);
                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    var tx = entity.get('xform.tx');
                    var ty = entity.get('xform.ty');
                    var tile = this.map.getTile(Math.floor(tx / 32), Math.floor(ty / 32));
                    if (tile.fade<1){
                        entity.componentCall('render', this.game.renderer, 'main');
                    }
                }.bind(this));
                this.updateUi();
            
            },
            _paused_tick : function(delta){
                this.game.renderer.track(this.pc);
                this.map.render(this.game.renderer);
                _.each(this._entity_ids, function(id){
                    var entity = this.entities[id];
                    entity.componentCall('render', this.game.renderer, 'main');
                }.bind(this))
            },
    	})

    	return DreddRLState;
    }
)
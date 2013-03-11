define(['./lib/class','./game', './map', './shadowcaster', './dungeongenerator', './entity', './gamestate', './config','./vendor/pxloader'],
    function(Class, Game, Map, ShadowCaster, DungeonGenerator, Entity, GameState, config, PxLoader){

    var RPGState = GameState.extend({
        initState: function(options){
            // Tile Map
            var size = 64;
            this.options = options || {};
            this._contactList = [];

            this._killList = [];
            this.map = new Map(size,size);
            this.game.renderer.createLayer('base');
            this.game.renderer.createLayer('main');
            this.game.renderer.createLayer('canopy');
            this.generator = new DungeonGenerator(this);
            this.shadows = new ShadowCaster(this.map);
            this.pc = this.createPC();
            this.loader = new PxLoader();
            this.loader.addCompletionListener(this.game.fsm.finishLoad.bind(this.game.fsm));
            this.loader.addImage(config.baseUrl + 'assets/quest/img/2/leatherarmor.png');
            this.loader.addImage(config.baseUrl + 'assets/quest/img/2/tilesheet.png');
            


            /* Bound Events */
            this.pause = function(){
                this.game.fsm.pause()
            }.bind(this);

            this.toggleShadows = function(){
                this.shadows.toggle()
            }.bind(this);
        },
        createPC : function(){
            var pc = null;
            
            if (this.options.persist){
                if (this.options.persist['pc']!==undefined){
                    pc = this.options.persist['pc'];
                    pc.set('xform.tx', (this.generator.rooms[0].cx + 0.5) * this.map.tileSize);
                    pc.set('xform.ty', (this.generator.rooms[0].cy + 0.5) * this.map.tileSize);
                }
            }
            if (pc==null){
                pc = new Entity({
                    xform : {
                        tx: (this.generator.rooms[0].cx + 0.5) * this.map.tileSize,
                        ty: (this.generator.rooms[0].cy + 0.5) * this.map.tileSize,
                        vx : Math.random() * 10 - 5,
                        vy : Math.random() * 10 - 5
                    },
                    controls : {},
                    sprite : {
                        src : 'assets/quest/img/2/leatherarmor.png',
                        width: 64,
                        offsetY: -16
                    },
                    anim : {
                        frames: {
                            walk_down : [35,36,37,38],
                            walk_up : [20,21,22,23],
                            walk_right : [5,6,7,8],
                            walk_left : { frames: [5,6,7,8], mirror: true}
                        },
                    },
                    movement : {
                        map: this.map,
                        speed: 16
                    },
                    health : {alignment:'good', life: 5}
                });
                pc.tags.push('pc');
                pc.addListener('kill', function(){
                    this.state._killList.push(pc);
                }.bind(pc));
            }
            this.addEntity(pc);
            return pc;
        },
        createStairs : function(tx, ty){
            var stairs = new Entity({
                xform: {
                    tx: (tx + 0.5) * this.map.tileSize,
                    ty: (ty + 0.5) * this.map.tileSize,
                    vx: 0,
                    vy: 0
                },
                sprite : {
                    src : 'assets/quest/img/2/tilesheet.png',
                    width: 32
                },
                eventmgr : {
                    callbacks : {
                        'contact.start' : (function(entity){
                            if (!entity.hasTag('pc')){
                                return;
                            }
                            var persist = { pc: this.pc};
                            var options = {persist : persist};
                            this.game._states['game'] = new RPGState(this.game, options);
                            this.game.fsm.startLoad();
                        }.bind(this))
                    }
                }
            });
            this.addEntity(stairs);
        },
        createEnemy : function(tx, ty){
            var life = Math.round(Math.random() * 4) + 6;
            var enemy = new Entity({
                xform : {
                    tx: (tx + 0.5) * this.map.tileSize,
                    ty: (ty + 0.5) * this.map.tileSize,
                    vx : (Math.random() - 0.5) * 2 * 96,
                    vy : (Math.random() - 0.5) * 2 * 96,
                },
                //controls : {},
                sprite : {
                    src : 'assets/quest/img/2/goblin.png',
                    width: 52,
                    offsetY: -16
                },
                anim : {
                    frames: {
                        walk_down : [28,29,30],
                        walk_up : [16,17,18],
                        walk_right : [4,5,6],
                        walk_left : { frames: [4,5,6], mirror: true}
                    },
                },
                movement : {
                    map: this.map,
                    speed: 16
                },
                //debug: {},
                simpleai : {},
                health : { life: life, maxLife: life}
            });
            enemy.addListener('kill', function(){
                this._killList.push(enemy);
            }.bind(this));
            this.addEntity(enemy);
            return enemy;
        },
        intersectRect : function(r1, r2) {
            return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
        },
        moveGameObject: function(entity, vx, vy){
            var tx = entity.get('xform.tx');
            var ty = entity.get('xform.ty');
            var nx = tx + vx;
            var ny = ty + vy;
            if (this.map){
                var dx = Math.floor(nx / 32);
                var dy = Math.floor(ny / 32);
                var xTile = this.map.getTile(dx, dy);
                if (xTile==null){
                    nx = tx;
                    ny = ty;
                } else {
                    if (xTile.passable!=true){
                        var qx = tx + vx;
                        var qy = ty + vy;
                        var tilex = Math.floor(qx / 32);
                        var tiley = Math.floor(qy / 32);
                        var tile = this.map.getTile(tilex,tiley);
                        if (tile.passable == false){
                            var horzPos = [qx, ty];
                            var vertPos = [tx, qy];
                            var horzTile = this.map.getTile(Math.floor(qx / 32),Math.floor(ty / 32));
                            var vertTile = this.map.getTile(Math.floor(tx / 32), Math.floor(qy / 32));
                            if (horzTile.passable){
                                qy = ty;
                            } else if (vertTile.passable) {
                                qx = tx;
                            } else {
                                qx = tx;
                                qy = ty;   
                            }
                        }
                        vx = qx - tx;
                        vy = qy - ty;
                        nx = qx
                        ny = qy;
                    }
                }

            }
            entity.set('xform.tx', nx);
            entity.set('xform.ty', ny);
            
            return [dx,dy];
        },
        resolveCollisions : function(delta){
            var entities = [];
            var newContacts = [];
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                var vx = entity.get('xform.vx') * delta;
                var vy = entity.get('xform.vy') * delta;
                this.moveGameObject(entity, vx, vy);
                entities.push(entity);
            }.bind(this));
            var count = 0;
            while (entities.length>1){
                var entityA = entities.shift();
                var txA = entityA.get('xform.tx');
                var tyA = entityA.get('xform.ty');
                var widthA = 16;
                var heightA = 16;
                var rectA = {
                    top: tyA - (heightA / 2),
                    bottom: tyA + (heightA / 2),
                    left: txA - (widthA / 2),
                    right: txA + (widthA / 2)
                }
                for (var i = entities.length - 1; i >= 0; i--) {
                    count++;
                    var entityB = entities[i];
                    var txB = entityB.get('xform.tx');
                    var tyB = entityB.get('xform.ty');
                    var widthB = 16;
                    var heightB = 16;
                    var rectB = {
                        top: tyB - (heightB / 2),
                        bottom: tyB + (heightB / 2),
                        left: txB - (widthB / 2),
                        right: txB + (widthB / 2)
                    }
                    if (this.intersectRect(rectA, rectB)){
                        var contactKey = entityA.id + '.' + entityB.id;
                        if (entityA.id > entityB.id){
                            contactKey = entityB.id + '.' + entityA.id;
                        }
                        newContacts.push(contactKey);
                        if (!_.contains(this._contactList, contactKey)){
                            //Fire New Contact Event
                            var ids = contactKey.split('.');
                            var entityA = this.getEntity(ids[0]);
                            var entityB = this.getEntity(ids[1]);
                            entityA.fireEvent('contact.start', entityB);
                            entityB.fireEvent('contact.start', entityA);
                        }

                        var xDelta1 = rectB.right - rectA.left;
                        var xDelta2 = rectB.left - rectA.right;
                        
                        var yDelta1 = rectB.top - rectA.bottom;
                        var yDelta2 = rectB.bottom - rectA.top;
                        
                        var xDelta = 0;
                        var yDelta = 0;
                        
                        if (Math.abs(xDelta1) > Math.abs(xDelta2)){
                            xDelta = xDelta2;
                        } else {
                            xDelta = xDelta1;
                        }
                        if (Math.abs(yDelta1) > Math.abs(yDelta2)){
                            yDelta = yDelta2;
                        } else {
                            yDelta = yDelta1;
                        }
                        if (Math.abs(xDelta) > Math.abs(yDelta)){
                            xDelta = 0;
                        } else {
                            yDelta = 0;
                        }
                        
                        var xADelta = 0;
                        var yADelta = 0;
                        
                        var xBDelta = 0;
                        var yBDelta = 0;
                        
                        /*
                        if (a.get('physics.type') & sge.Physics.TYPES.STATIC){
                            xBDelta = -xDelta;
                            yBDelta = -yDelta;
                        } else if (b.get('physics.type') & sge.Physics.TYPES.STATIC){
                            xADelta = xDelta;
                            yADelta = yDelta;
                        } else {
                        */
                            xADelta = xDelta/2;
                            yADelta = yDelta/2;
                            xBDelta = xDelta/-2;
                            yBDelta = yDelta/-2;
                        /*
                        }
                        */
                        this.moveGameObject(entityA, xADelta,  yADelta);
                        this.moveGameObject(entityB, xBDelta,  yBDelta);
                        
                    }
                }
            }
            for (var i = this._contactList.length - 1; i >= 0; i--) {
                if (!_.contains(newContacts, this._contactList[i])){
                    //Fire End Contact Event
                    var ids = this._contactList[i].split('.');
                    var entityA = this.getEntity(ids[0]);
                    var entityB = this.getEntity(ids[1]);
                    if (entityA){
                        entityA.fireEvent('contact.end', entityB);
                    }
                    if (entityB){
                        entityB.fireEvent('contact.end', entityA);
                    }
                }
            };
            this._contactList = newContacts;
        },
        startState : function(){
            this.input.addListener('keydown:space', this.pause);
            this.input.addListener('keydown:F', this.toggleShadows);
        },
        endState : function(){
            this.input.removeListener('keydown:space', this.pause)
            this.input.removeListener('keydown:F', this.toggleShadows)        
        },
        tick : function(delta){
            this.tickTimeouts(delta);
            this.resolveCollisions(delta);
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                entity.componentCall('tick', delta);
            }.bind(this));
            _.each(this._killList, function(e){
                this.removeEntity(e);
            }.bind(this))
            this.game.renderer.track(this.pc);
            this.shadows.tick(this.pc.get('xform.tx'),this.pc.get('xform.ty'));
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
        
        },
        _paused_tick : function(delta){
            this.game.renderer.track(this.pc);
            this.map.render(this.game.renderer);
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                entity.componentCall('render', this.game.renderer, 'main');
            }.bind(this))
        }
    });

    return RPGState;
});
define(['sge'], function(sge){
    TYPES = {
        KINETIC : 0,   //Full "Physics" Simulation,
        STATIC : 1,    //Don't move. Can be collided with, not tested aginst other static objects
        PASS : 2       //Moves, fires collision events but does not resolve collisions.
    }

    var RPGPhysics = sge.Class.extend({
        init : function(state){
            this.state = state;
            this.map = state.map;
            this._contactList = []
            this._newContactList = [];
        },
        intersectRect : function(r1, r2) {
            return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
        },
        testTilePassable: function(tx, ty){
            var tile = this.map.getTile(tx, ty);
            var result = true;
            if (tile){
                result = tile.passable!=true;
            }
            return result;
        },
        traceStaticTiles : function(x0, y0, x1, y1){
           var dx = Math.abs(x1-x0);
           var dy = Math.abs(y1-y0);
           var sx = (x0 < x1) ? 1 : -1;
           var sy = (y0 < y1) ? 1 : -1;
           var err = dx-dy;

           while(true){
             var result = this.testTilePassable(x0,y0);  // Do what you need to for this
             if (result){
                return [x0, y0, true];
             }
             if ((x0==x1) && (y0==y1)) break;
             var e2 = 2*err;
             if (e2 >-dy){ err -= dy; x0  += sx; }
             if (e2 < dx){ err += dx; y0  += sy; }
           }
           return [x1, y1, false];
        },
        moveGameObject: function(entity, vx, vy){
            var tx = Math.round(entity.get('xform.tx'));
            var ty = Math.round(entity.get('xform.ty'));
            var nx = Math.round(tx + vx);
            var ny = Math.round(ty + vy);
            if (this.map){
                if (entity.get('physics.fast')){
                    x0 = Math.floor(tx/32);
                    y0 = Math.floor(ty/32);
                    x1 = Math.floor(nx/32);
                    y1 = Math.floor(ny/32);
                    if (x0!=x1||y0!=y1){
                        var result = this.traceStaticTiles(x0, y0, x1, y1);
                        if (result[2]){
                            entity.fireEvent('contact.tile');
                            
                            intersection = sge.collision.lineRectIntersect(tx, ty, nx, ny, this.map.getTile(result[0], result[1]).getRect())
                            nx = intersection[0];
                            ny = intersection[1];
                            console.log(tx, ty, nx, ny, this.map.getTile(result[0], result[1]).getRect(), intersection);
                        }
                    }
                } else {
                    var dx = Math.floor(nx / 32);
                    var dy = Math.floor(ny / 32);
                    var xTile = this.map.getTile(dx, dy);
                    if (xTile==null){
                        nx = tx;
                        ny = ty;
                        entity.fireEvent('contact.tile');
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
                                entity.fireEvent('contact.tile');
                            }
                            vx = qx - tx;
                            vy = qy - ty;
                            nx = qx
                            ny = qy;
                        }
                    }
                }


            }
            if (nx!=tx || ny!=ty){
                entity.set('xform.t', nx, ny);
            }
            
            return [nx,ny];
        },
        resolveCollisions : function(delta){
            var entities = [];
            var newContacts = [];
            _.each(this.state.getEntitiesWithComponent('physics'), function(entity){
                entities.push(entity);
                if (entity.get('physics.type') & TYPES.STATIC){
                    return;
                }
                if (entity.get('physics')._wait){
                    entity.get('physics')._wait = false;
                    return;
                }
                var vx = entity.get('xform.vx') * delta;
                var vy = entity.get('xform.vy') * delta;
                this.moveGameObject(entity, vx, vy);
                
            }.bind(this));
            var count = 0;
            while (entities.length>1){
                var entityA = entities.shift();
                var isStaticA = Boolean(entityA.get('physics.type') & TYPES.STATIC);
                var txA = entityA.get('xform.tx');
                var tyA = entityA.get('xform.ty');
                var widthA = entityA.get('physics.width');
                var heightA = entityA.get('physics.height');;
                var rectA = {
                    top: tyA - (heightA / 2),
                    bottom: tyA + (heightA / 2),
                    left: txA - (widthA / 2),
                    right: txA + (widthA / 2)
                }
                for (var i = entities.length - 1; i >= 0; i--) {
                    count++;
                    var entityB = entities[i];
                    var isStaticB= Boolean(entityB.get('physics.type') & TYPES.STATIC);
                    if (isStaticA & isStaticB){
                        continue;
                    }
                    var txB = entityB.get('xform.tx');
                    var tyB = entityB.get('xform.ty');
                    var widthB = entityB.get('physics.width');;
                    var heightB = entityB.get('physics.height');;
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
                            var entityA = this.state.getEntity(ids[0]);
                            var entityB = this.state.getEntity(ids[1]);
                            entityA.fireEvent('contact.start', entityB);
                            entityB.fireEvent('contact.start', entityA);
                        }


                        if (entityA.get('physics.type')==TYPES.PASS || entityB.get('physics.type')==TYPES.PASS){
                            continue;
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
                        
                        if (entityA.get('physics.type') & TYPES.STATIC){
                            xBDelta = -xDelta;
                            yBDelta = -yDelta;
                        } else if (entityB.get('physics.type') & TYPES.STATIC){
                            xADelta = xDelta;
                            yADelta = yDelta;
                        } else {
                            xADelta = xDelta/2;
                            yADelta = yDelta/2;
                            xBDelta = xDelta/-2;
                            yBDelta = yDelta/-2;
                        }
                        this.moveGameObject(entityA, xADelta,  yADelta);
                        this.moveGameObject(entityB, xBDelta,  yBDelta);
                        
                    }
                }
            }
            for (var i = this._contactList.length - 1; i >= 0; i--) {
                if (!_.contains(newContacts, this._contactList[i])){
                    //Fire End Contact Event
                    var ids = this._contactList[i].split('.');
                    var entityA = this.state.getEntity(ids[0]);
                    var entityB = this.state.getEntity(ids[1]);
                    if (entityA){
                        entityA.fireEvent('contact.end', entityB);
                    }
                    if (entityB){
                        entityB.fireEvent('contact.end', entityA);
                    }
                }
            };
            this._contactList = newContacts;
        }
    });
    return RPGPhysics;
});

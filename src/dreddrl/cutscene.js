define(['sge'], function(sge){

    var when = sge.vendor.when;

    var navTo = function(cutscene, entity, target){

        var deferred = new when.defer();
        var tx = entity.get('xform.tx');
        var ty = entity.get('xform.ty');
        var tileX = Math.floor(tx/32);
        var tileY = Math.floor(ty/32);
        var tx2 = target.get('xform.tx');
        var ty2 = target.get('xform.ty');
        var endTileX = Math.floor(tx2/32);
        var endTileY = Math.floor(ty2/32);
        var pathPoints = entity.state.map.getPath(tileX, tileY,endTileX,endTileY);

        var tickFunc = function(delta){
            var tx = entity.get('xform.tx');
            var ty = entity.get('xform.ty');
            var goalX = pathPoints[0][0];
            var goalY = pathPoints[0][1];
            var dx = goalX - tx;
            var dy = goalY - ty;
            var dist = Math.sqrt((dx*dx)+(dy*dy));
            if (dist<16){
                pathPoints.shift();
                if (pathPoints.length<=0){
                    cutscene.removeTickFunc(tickFunc);
                    cutscene.deactiveEntities(entity);
                    deferred.resolve();
                    return;
                }
            } else {
                entity.set('movement.v', dx / dist, dy / dist)
                console.log(entity.get('xform.vx'), entity.get('xform.vy'))
                console.log('Tick', dx / dist, dy / dist);
            }
        }
        cutscene.activateEntities(entity)
        cutscene.addTickFunc(tickFunc);
        return deferred.promise;
    }

    var EntityCutsceneActions = {
        navigate : function(cutscene, entity, target){
	        navTo(cutscene, entity, target).then(function(){
                cutscene.completeAction();
            })
        },
        dialog: function(cutscene, node){
            cutscene.startDialog(node);
        },
        moveAway: function(cutscene){
            cutscene.completeAction();
        },
        event: function(cutscene, entity, evt, arg0, arg1, arg2){
            entity.fireEvent(evt, arg0, arg1, arg2);
	        cutscene.completeAction();
        },
        set: function(cutscene, entity, attr, value, arg1, arg2, arg3){
            entity.set(attr, value, arg1, arg2, arg3);
            cutscene.completeAction();
        },
        behave: function(cutscene, entity, behaviour, options){
            entity.set('ai.behaviour', behaviour, options);
            cutscene.completeAction();
        },
        add: function(cutscene, entity){
            cutscene.gameState.addEntity(entity);
            cutscene.completeAction();
        }
    }

    var RoomCutsceneActions = {
    	close : function(cutscene, room){
    		room.closeDoors();
    		cutscene.completeAction();
    	},
    	open : function(cutscene, room){
    		room.openDoors();
    		cutscene.completeAction();
    	},
        lock : function(cutscene, room, keyType){
            if (keyType === undefined){
                keyType = true;
            }
            room.lockDoors(keyType);
            cutscene.completeAction();
        },
    	highlight : function(cutscene, room, highlight){
    		room.highlight(highlight);
    		cutscene.completeAction();
    	}
    }

    var CameraCutsceneActions = {
    	pan : function(cutscene, target, options){
    		options = options || {};
    		var cam_t = cutscene.gameState.getCameraLocation();
    		var tx = target.get('xform.tx');
    		var ty = target.get('xform.ty');
    		var dx = (tx - cam_t[0]);
    		var dy = (ty - cam_t[1]);
    		var dist = Math.sqrt(dx*dx+dy*dy);
    		var speed = options.speed || 196;
    		dx = (dx/dist)*speed;
    		dy = (dy/dist)*speed;
    		var i = 0;
    		var cb = function(delta){
    			i+=1;
    			cam_t = cutscene.gameState.getCameraLocation();
    			cutscene.gameState.setCameraLocation(cam_t[0]+(dx*delta), cam_t[1]+(dy*delta));
	    		if (Math.abs(cam_t[0]-tx)<(speed*delta*2)||Math.abs(cam_t[1]-ty)<(delta*2*speed)){
		    		cutscene.removeTickFunc(cb);
		    		cutscene.completeAction();
		    	}

    		}
    		cutscene.addTickFunc(cb);
    	},
    	wait : function(cutscene, wait){
    		setTimeout(function(){
    			cutscene.completeAction();
    		}, wait);
    	}
    }

    var Cutscene = sge.Class.extend({
        init: function(state){
        	this.deferred = when.defer();
            this.state = state;
            this._playing = false;
            this.gameState = state.game._states.game;
            this._queue = [];
            this.actions = {
                entity: EntityCutsceneActions,
                room: RoomCutsceneActions,
                camera: CameraCutsceneActions
            }
        },
        activateEntities : function(args){
            for (var i = arguments.length - 1; i >= 0; i--) {
                this.state._activeEntities.push(arguments[i]);
            };
        },
        deactiveEntities: function(args){
            for (var i = arguments.length - 1; i >= 0; i--) {
                var idx = this.state._activeEntities.indexOf(arguments[i]);
                if (idx>=0){
                    this.state._activeEntities.splice(idx,1);
                }
            };
        },
        play: function(){
        	this.state.game.fsm.startCutscene();
        	this._playing = true;
            this.next();
            return this.deferred.promise;
        },
        end: function(result){
        	this._playing = false;
        	if (result){
        		this.result(result);
        	}
            this.state.endScene();
            this.deferred.resolve(this._result);
        },
        result: function(result){
        	this._result = result
        },
        startDialog : function(node, ctx){
        	ctx = ctx || {};
        	ctx['cutscene'] = this;
        	console.log(ctx);
            this.state.setDialog(node, ctx, this.completeAction.bind(this));
        },
        next: function(){
            if (this._queue.length<=0){
                this.end();
            }
            if (this._playing == false){
            	return
            }
            var action = this._queue.shift();
            var args = action.args;
            args.splice(0,0,this);
            var lib = action.callback.split('.')[0];
            var func = action.callback.split('.')[1];
            var callback = this.actions[lib][func];
            callback.apply(this, args)
        },
        completeAction: function(data){
            if (this._queue.length>0){
                this.next(data);
            } else {
                this.end(data);
            }
        },
        addAction: function(){
            var args = Array.prototype.slice.call(arguments);
            var callback = args.shift();
            var action = {
                callback: callback,
                args: args
            }
            this._queue.push(action);
        },
        addTickFunc: function(func){
        	this.state._tickCallbacks.push(func);
        },
        removeTickFunc: function(func){
        	var idx = this.state._tickCallbacks.indexOf(func);
        	if (idx>=0){
        		this.state._tickCallbacks.splice(idx,1);
        	}
        }
    })
    return Cutscene;
});
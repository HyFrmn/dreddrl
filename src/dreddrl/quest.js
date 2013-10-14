define(['sge', './expr', './item', './config'], function(sge, Expr, Item, config){
	/**
	* Represents a node in a dialog tree.
	*
	*/

	var when = sge.vendor.when;


	var eventId = 0;
	var whenEntityEvent = function(entity, eventName){
		var func = function(){
			
			var deferred = when.defer();
			var listener = function(){
				entity.removeListener(eventName, listener);
				deferred.resolve();
			}
			entity.addListener(eventName, listener);
			return deferred.promise;
		}
		return func;
	}

	var EntityCutsceneActions = {
        navigate : function(cutscene, entity, target){
            cutscene.activateEntities(entity);
            var cb = function(){
                cutscene.deactiveEntities(entity);
                cutscene.completeAction();
            }.bind(this);
            if (isArray(target)){
            	entity.get('navigate').navToPoint(target[0],target[1], cb);
            } else {
	            entity.get('navigate').navToEntity(target, cb);
	        }
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
        set: function(cutscene, entity, attr, value){
            entity.set(attr, value);
            cutscene.completeAction();
        },
        behave: function(cutscene, entity, behaviour, options){
            entity.set('ai.behaviour', behaviour, options);
            cutscene.completeAction();
        },
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
        	var id = eventId;
			eventId++;
			this.id=id;
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
        	console.log('Q:', this.id, this._queue);
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
        	console.log('Complete', this.id)
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

	var Quest = sge.Class.extend({
		init: function(block, setupFunc){
			this._context = {
				quest: this
			};
			this._step = -1;
			this._steps = {};
			this._state = block.state;
			this.name = "Quest";
			this.reward = {}
			setupFunc.apply(this, [block, block.state]);
			this.startStep(0);
		},
		addContext: function(key, value){
			this._context[key] = value;
		},
		createDialog: function(tree){
			var dialog;
			if (Object.prototype.toString.call( tree ) === '[object Array]'){
				dialog = {
					tree: tree,
				}
			} else {
				dialog = tree;
			}
			if (dialog.context===undefined){
				dialog.context={}
			}
			var keys = Object.keys(this._context);
			for (var i = keys.length - 1; i >= 0; i--) {
				dialog.context[keys[i]] = this._context[keys[i]];
			};
			return dialog;
		},
		get: function(key){
			return this._context[key];
		},
		addStep: function(step, func){
			this._steps[step] = func;
		},
		startStep: function(step){
			this._step = step;
			var func = this._steps[step];
			func.apply(this);
		},
		nextStep: function(){
			if (this._step<0){
				return;
			}
			var stepNumbers = Object.keys(this._steps).map(parseFloat);
			var index = stepNumbers.indexOf(this._step);
			if (index>=stepNumbers.length-1){
				this.onComplete();
			} else {
				var nextStep = stepNumbers[index+1];
				this.startStep(nextStep);
			}
		},
		complete: function(){
			//this._step = -1;
			this.onComplete();
		},
		onComplete: function(){
			this._state.log('Quest Completed: ' + this.name);
			//TODO: Give Rewards.
		},
		createEntity: function(tag, options){
			var entity = null;
			if (typeof tag === 'string'){
				if (tag.match(/@/)){
					var tag = tag.match(/^@\(([a-z]*)\)/)[1];
					var results = this._state.getEntitiesWithTag(tag);
					entity = sge.random.item(results);
					while (entity.meta.quest!==undefined){
						entity = sge.random.item(results)
					}
					entity.meta.quest = this;
				} else {
					entity = this._state.factory(tag, options);
					//this._state.addEntity(entity);
				}
			} else {
				entity = tag;
			}
			entity.addContext(this._context);
			return entity;
		},
		createItem : function(type, options){
			var item = null;
			item = Item.Factory(type, options || {});
			item.addContext(this._context);
			return item;
		}
	});

	
	Quest.Factory = function(megablock, questData){
		var quest = new Quest(megablock, function(block, state){
			//Reward Data.
			//console.log('Creating:', questData);
			this.name = questData.name;
			//Items 
			for (var i = questData.items.length - 1; i >= 0; i--) {
			var itemData = questData.items[i];
				var item = this.createItem(itemData.type, itemData);
				this.addContext(itemData.name, item);
			};

			//Create Entities.
			for (var i = questData.entities.length - 1; i >= 0; i--) {
				var entityData = questData.entities[i];
				var ctxName = entityData.name;
				var entity = this.createEntity(entityData.type);
				if (entityData.inventory){
					for (var j = entityData.inventory.length - 1; j >= 0; j--) {
						var item = this.get(entityData.inventory[j]);
						entity.fireEvent('inventory.add', item);
					};
				}

				this.addContext(ctxName, entity);

				if (entityData.dialog!==undefined){
					entity.set('dialog.tree', this.createDialog(entityData.dialog));
				}
			}

			

			//Rooms
			for (var i = questData.rooms.length - 1; i >= 0; i--) {
				var roomData = questData.rooms[i];
				var room = block.getRandomRoom();
				for (var j = roomData.entities.length - 1; j >= 0; j--) {
					var entity = this.get(roomData.entities[j]);
					room.spawn(entity);
				}
				if (roomData.closed){
					room.closeDoors();
				}
				if (roomData.locked){
					room.lockDoors();
				}
				this.addContext(roomData.name, room);
			}

			this._stepData = {};
			for (i = questData.steps.length - 1; i >= 0; i--) {
				var number = parseInt(questData.steps[i].number,10);
				this._stepData[number] = questData.steps[i]
				this.addStep(number, function(){
					var stepData = this._stepData[this._step];
						if (stepData.dialog){
							for (var j = 0; j<stepData.dialog.length;j++) {
								var node = stepData.dialog[j];
								var entityName = node.entity.name;
								var entity=this._context[entityName];
								var tree =  this.createDialog(node);
								if (!entity.get('dialog')){
									entity.addComponent('interact', {}).register(entity.state);
									entity.addComponent('dialog',{}).register(entity.state);
								}
								entity.set('dialog.tree', this.createDialog([tree]));
							};
						}

						if (stepData.code!==undefined){
							var expr = new Expr(stepData.code);
							expr.loadContext(this._context);
							expr.run()
						}
				})
			};
		});
	};

	Quest.Load = function(megablock){
		if (config.questDataUrl&&false){
			sge.util.ajax(config.questDataUrl, function(rawText){
				data = JSON.parse(rawText);
				console.log(data);
				data.forEach(function(quest){
					if (quest.enable){
						console.log('Load Quest:', quest.name);
						Quest.Factory(megablock, quest);

					}
				})
				megablock.populateRooms();
			}.bind(this));
		} else {
			/**
			*
		    * A basic quest with multiple steps.
		    *
		    * * NPC needs help.
		    * * Locate Criminal with item.
		    * * Kill Criminal. Locate dropped item.
		    * * Pick Dropped Item. Locate NPC.
		    * * Return Item. Get Reward Quest Over
		    *
			*/

			//Get Quest Room
			var room = megablock.getRandomRoom();
			room.lockDoors();
			
			//Get citizen entity, initialize for interaction.
			var citizen = megablock.state.getEntitiesWithTag('shopper')[0];
			citizen.addComponent('interact',{}).register(megablock.state);
			
			

			var introCutscene = function(){
				console.log('Intro')
				var pc     = megablock.state.pc;
				var cutscene = new Cutscene(megablock.state.game._states['cutscene']);
				cutscene.addAction('entity.dialog',  {
                        topic: '',
                        dialog: [{
                        			entity:'npc',
                        			text: "Judge, can you escort me home. I just went shopping and am afraid I will be robbed.\ (Use the arrow keys to move around.)",
                        }],
                        choices: [{
            				topic: "I'm here to protect and server. Where do you live?",
            				dialog: {entity:'npc', text: "Over there."},
            				postAction: "cutscene.result(true)"
            			},{
            				topic: "Sorry citizen. I have bigger fish to fry.",
            				dialog: {entity: 'npc', text: "Shit. Well I need to get home quckly."},
            				postAction: "cutscene.end(false)"
            			}]			
                });
                citizen.set('interact.priority', false);
                cutscene.addAction('camera.pan', room.doors[0]);
                cutscene.addAction('room.highlight', room, true);
                cutscene.addAction('camera.wait', 1000);
                cutscene.addAction('camera.pan', pc);
                return cutscene.play();
			}


			var startMission = function(choice){
				var deferred = new when.defer();
				console.log('Choice:', choice, Boolean(choice));
				if (choice){
					var pc     = megablock.state.pc;
					citizen.set('ai.behaviour', 'follow', pc);
					deferred.resolve()
				} else {
					//Recreate interaction?
					console.log('Reset');
					
					setTimeout(function(){
						console.log('Create Mission')
						createMission();
					}, 1200);
					
					deferred.reject()
				}
				return deferred.promise;
			}

			var completeMission = function(){
				var cutscene = new Cutscene(megablock.state.game._states['cutscene']);
            	cutscene.addAction('entity.dialog',  {
                    topic: '',
                    dialog: [{entity:'npc', text: "Thanks for getting escorting me home." }],
            	});
            	cutscene.addAction('entity.navigate', citizen, room);
            	cutscene.addAction('room.close', room);
            	citizen.set('ai.behaviour', 'idle');
            	room.highlight(false);
            	room.openDoors();
				return cutscene.play();
			}

			//First interaction.
			var createMission = function(){
				citizen.set('interact.priority', true);
				var interaction = whenEntityEvent(citizen, 'interact')().
									then(introCutscene).
									then(startMission).
									then(whenEntityEvent(room.doors[0],'unlock')).
									then(completeMission);
			}
			createMission();
			megablock.populateRooms();
		}
	}


	return Quest;
});

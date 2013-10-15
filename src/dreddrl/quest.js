define(['sge', './cutscene', './expr', './item', './config'], function(sge, Cutscene, Expr, Item, config){
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

	var QUESTLIST = [];
	Quest.Add = function(text){
		QUESTLIST.push(text);
	}

	Quest.Load = function(megablock){
		var block = megablock;
		QUESTLIST.forEach(function(text){
			eval(text);
		})
	}

	Quest._Load = function(megablock){
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
			/*
			//Get Quest Room
			var room = megablock.getRandomRoom();
			room.lockDoors();
			
			//Get citizen entity, initialize for interaction.
			var citizen = megablock.state.getEntitiesWithTag('shopper')[0];
			citizen.addComponent('interact',{}).register(megablock.state);
			
			

			var introCutscene = function(){
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
                cutscene.addAction('entity.set', citizen, 'interact.priority', false);
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
            	cutscene.addAction('entity.set', citizen, 'ai.region', room);
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
			*/
		}
	}


	return Quest;
});

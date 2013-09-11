define(['sge', './expr', './item', './config'], function(sge, Expr, Item, config){
	/**
	* Represents a node in a dialog tree.
	*
	*/
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
			this._step = -1;
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
		if (config.questDataUrl){
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
			
			var exampleQuest = new Quest(megablock, function(block, state){

				//Set Reward
				this.reward = {
					xp: 100,
					health: 1000,
					ammo: 12,
					keys: 3
				}

				//Create/Select Entities and Items.
				var npc = this.createEntity('@(shopper)');
				var lostItem = this.createItem('watch');
				this.addContext('victim', npc);
				this.addContext('lostItem', lostItem);
				
				


				//Step always called during setup.
				this.addStep(0, function(){
					npcDialog = this.createDialog([{
						topic: 'Excuse me citizen. Do you need help?',
						dialog: [{entity:'npc', text: 'Yes. Someone stole my watch. Can you find it?'}],
						choices: [{
							topic:  "Yes. I'll find your watch.",
							dialog: [{entity:'npc', text: 'Thanks'}],
							postAction: 'quest.nextStep();'
						},{
							topic: "Sorry. I can't help.",
							dialog: [{entity:'npc', text: 'What! You can\'t help? Why the hell are you even here?'}],
						}]
					}]);
					npc.set('dialog.tree', npcDialog);
					npc.set('interact.priority', true);
				});
				this.addStep(10, function(){
					npcDialog = this.createDialog([{
						topic: "I still haven't found your missing watch.",
						dialog: [{entity:'npc', text: "Well keep looking. Why the #!$^ do i pay my taxes." }],
					}]);
					npc.set('dialog.tree', npcDialog);
					npc.set('interact.priority', false);
					var thief = this.createEntity('lawbreaker',{
					});
					thief.set('xform.t', block.width*16,block.height*16);
					thief.fireEvent('inventory.add', lostItem);
					block.state.addEntity(thief);
					lostItem.set('actions.pickup', 'quest.nextStep()');
				});
				this.addStep(20, function(){
					npcDialog = this.createDialog([{
						topic: "Is this your watch citizen?",
						dialog: [{entity:'npc', text: "YES!! Thank YOU!! Hooray!!." }],
						postAction: 'quest.nextStep()'
					}]);
					npc.set('dialog.tree', npcDialog);
					npc.set('interact.priority', true);
				});
				this.addStep(100, function(){
					npcDialog = this.createDialog([{
						topic: 'Excuse me citizen. Do you need help?',
						dialog: [{entity:'npc', text: "Thank you for finding my watch." }],
					}]);
					npc.set('dialog.tree', npcDialog);
					npc.set('interact.priority', false);
					this.complete();
				})
			})
			megablock.populateRooms();
		}
	}


	return Quest;
});

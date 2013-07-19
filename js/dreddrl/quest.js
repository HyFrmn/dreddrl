define(['sge', './item', './config'], function(sge, Item, config){
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
			console.log('Start:',this._step);
			var func = this._steps[step];
			func.apply(this);
		},
		nextStep: function(){
			if (this._step<0){
				return;
			}
			var stepNumbers = Object.keys(this._steps).map(parseFloat);
			var index = stepNumbers.indexOf(this._step);
			console.log('Step:', index, stepNumbers, this._step);
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
			this._state.log('Complete: ' + this.name);
			//TODO: Give Rewards.
		},
		createEntity: function(tag, options){
			var entity = null;
			if (typeof tag === 'string'){
				if (tag.match(/@/)){
					var tag = tag.match(/^@\(([a-z]*)\)/)[1];
					var results = this._state.getEntitiesWithTag(tag)
					entity = sge.random.item(results)
				} else {
					entity = this._state.factory(tag, options);
					this._state.addEntity(entity);
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

	Quest.Load = function(megablock){
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
					pc: 'Excuse me citizen. Do you need help?',
					npc: 'Yes. Someone stole my watch. Can you find it?',
					choices: [{
						pc:  "Yes. I'll find your watch.",
						npc: "Thanks",
						postAction: 'quest.nextStep();'
					},{
						pc: "Sorry. I can't help.",
						npc: "No good judge."
					}]
				}]);
				npc.set('dialog.tree', npcDialog);
				npc.set('interact.priority', true);
			});
			this.addStep(10, function(){
				npcDialog = this.createDialog([{
					pc: "I still haven't found your missing watch.",
					npc: "Well keep looking. Why the #!$^ do i pay my taxes."
				}]);
				npc.set('dialog.tree', npcDialog);
				npc.set('interact.priority', false);
				var thief = this.createEntity('lawbreaker',{
					deaddrop: {
						items: [lostItem]
					}
				});
				thief.set('xform.t', block.width*16,block.height*16);
				lostItem.set('actions.pickup', 'quest.nextStep()');
			});
			this.addStep(20, function(){
				npcDialog = this.createDialog([{
					pc: "Is this your watch citizen?",
					npc: "Yes! THANK YOU!",
					postAction: 'quest.nextStep()'
				}]);
				npc.set('dialog.tree', npcDialog);
				npc.set('interact.priority', true);
			});
			this.addStep(100, function(){
				npcDialog = this.createDialog([{
					pc: 'Excuse me citizen. Do you need help?',
					npc: 'No. I got my watch back.'
				}]);
				npc.set('dialog.tree', npcDialog);
				npc.set('interact.priority', false);
				this.complete();
			})
		})
		*/
		
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
		var rescueQuest = new Quest(megablock, function(block, state){

			//Set Reward
			//Set Reward
			this.reward = {
				xp: 150,
				health: 1000,
				keys: 1
			}

			//Create/Select Entities and Items.
			var room = block.getRandomRoom();
			var father = this.createEntity('@(shopper)');
			this.addContext('father', father);
			var daughter = this.createEntity(room.spawn('woman.young',{}));
			this.addContext('daughter', daughter);
			
			console.log(daughter);


			//Step always called during setup.
			this.addStep(0, function(){
				npcDialog = this.createDialog([{
					pc: 'Excuse me citizen. Do you need help?',
					npc: "Yes, I can't find my daughter. If you see her, can you let her know where I am?",
					choices: [{
						pc:  "Of course",
						npc: "Thank you so much.",
						postAction: 'quest.nextStep();'
					},{
						pc: "Sorry. I can't help.",
						npc: "The fuck you mean you can't help!"
					}]
				}]);
				father.set('dialog.tree', npcDialog);
				father.set('interact.priority', true);
			});
			this.addStep(10, function(){
				npcDialog = this.createDialog([{
					pc: "I still haven't found your missing watch.",
					npc: "Well keep looking. Why the #!$^ do i pay my taxes."
				}]);
				father.set('dialog.tree', npcDialog);
				father.set('interact.priority', false);
				daughter.set('interact.priority', true);
				daughter.set('dialog.tree', this.createDialog([{
					pc: "Your father is looking for you.",
					npc: "Thanks I'll go find him.",
					postAction: "quest.nextStep(); "
				},]))

			});
			this.addStep(20, function(){
				npcDialog = this.createDialog([{
					npc: "THANK YOU! Thank you for finding my daughter.",
					postAction: 'quest.nextStep()'
				}]);
				daughterDialog = this.createDialog([{
					npc: "Thank you for saving me.",
					postAction: 'quest.nextStep()'
				}]);
				father.set('dialog.tree', npcDialog);
				father.set('interact.priority', true);
				daughter.set('interact.priority', false);

			});
			this.addStep(100, function(){
				npcDialog = this.createDialog([{
					npc: 'Thank you for finding my daughter.'
				}]);
				father.set('dialog.tree', npcDialog);
				father.set('interact.priority', false);
				this.complete();
			})
		})
	}


	return Quest;
});

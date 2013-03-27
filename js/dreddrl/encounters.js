define(['sge'], function(sge){
	var Encounter = sge.Class.extend({
		init: function(block){
			this.block = block;
			this.state = block.state;
			this.factory = block.factory;
			this.status = 0;
			this.total = 1;
			this.start();
		},
		isFinished: function(){
			return (this.status>=this.total);
		},
		start: function(){

		},
		finish: function(){

		},
		tick: function(){
			/**
			*
			*/

		},
		getPC : function(){
			return this.state.getEntityWithTag('pc');
		},
		update: function(status){
			if (this.isFinished()){
				this.finish();
			};
		}
	});

	var CheckupEncounter = Encounter.extend({
	        start: function(){
	        	this.total = 3;
	            //Create Mother
	            var mothersRoom = this.block.getRandomEncounterRoom();
	            console.log(mothersRoom);
	            var mother = this.state.factory('woman', {
	                xform: {
	                    tx: mothersRoom.cx * 32,
	                    ty: mothersRoom.cy * 32
	                },
	                interact : {},
	                encounter: {
	                    encounter : this,
	                },
	                actions: {
	                    interact :
	                        ['switch', '${encounter.status}', 
	                            [
	                                ['dialog', "Please help me! I haven't seen my daughter all day. Can you find her and make sure she is ok. Thanks."],
	                                ['set', 'encounter.status', 1]
	                            ],[
	                                ['dialog', "Have you found my daughter yet?! I'm worried!"]
	                            ],[
	                                ['dialog', "Thank you for finding my daughter. Here take this for your trouble."],
	                                ['set','@(pc).stats.xp', 50, 'add'],
	                                ['set', 'encounter.status', 3]
	                            ],[
	                                ['dialog', "Welcome to Peach Trees. "]
	                            ]
	                        ]
	                }
	            });
	            mother.tags.push('mother');
	            this.block.state.addEntity(mother);
	            

	            //Create Daughter
	            var daughtersRoom = this.block.getRandomEncounterRoom({exclude: [mothersRoom]});
	            var daughter = this.state.factory('woman.young', {
	                xform: {
	                    tx: daughtersRoom.cx * 32,
	                    ty: daughtersRoom.cy * 32
	                },
	                interact : {},
	                encounter: {
	                    encounter : this,
	                },
	                actions: {
	                   interact :
	                        ['if', '${encounter.status}==1', 
	                            [
	                                ['dialog', "Yes, I'm doing fine. Tell my mom I'm fine."],
	                                ['set', 'encounter.status', 2]
	                            ],[
	                                ['dialog', "Hey there. Haven't seen you around the block before."]
	                            ]
	                        ] 
	                }
	            });
	            daughter.tags.push('daughter');
	            this.block.state.addEntity(daughter);
	        	console.log('Checkup')
	        },
	        finish: function(){
	        	var pc = this.getPC();
	        	pc.set('stats.xp', 50, 'add');
	        	this.state.log('Completed Checkup Encounter');
	        }
	    });

	    var ExecuteEncounter = Encounter.extend({
	        start: function(){
	            //Create Mother
	            var gangBossRoom = this.block.getRandomEncounterRoom();
	            var gangBoss = this.state.factory('gangboss', {
	                xform: {
	                    tx: gangBossRoom.cx * 32,
	                    ty: gangBossRoom.cy * 32
	                },
	                encounter: {
	                	encounter : this
	                },
	                actions : {
	                	kill : 
		                	['if', true, 
		                		[
		                			['set','@(pc).stats.xp', 5, 'add'],
	                				['set', 'encounter.status',1]
	                			]
	                		]
	                }
	            });
	            gangBoss.tags.push('gangboss');
	            this.block.state.addEntity(gangBoss);
	        },
	        finish: function(){
	        	var pc = this.getPC();
	        	pc.set('stats.xp', 50, 'add');
	        	this.state.log('Completed Execute Gang Boss');
	        }
	    });

	var RescueEncounter = Encounter.extend({
		start: function(){

		}
	});



	return {
		Encounter : Encounter,
		ExecuteEncounter : ExecuteEncounter,
		CheckupEncounter : CheckupEncounter,
	}
})
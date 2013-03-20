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
		start: function(){

		},
		finish: function(){

		},
		tick: function(){
			/**
			*
			*/

		},
		update: function(status){
			if (status>=this.total){
				this.finish();
			};
		}
	});

	var CheckupEncounter = Encounter.extend({
	        start: function(){
	        	this.total = 3;
	            //Create Mother
	            var mothersRoom = sge.random.item(this.block.rooms);
	            console.log(mothersRoom);
	            var mother = this.state.factory('women', {
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
	            var daughtersRoom = sge.random.item(this.block.rooms);
	            var daughter = this.state.factory('daughter', {
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
	        	console.log('Complete Checkup Encounter');
	        }
	    });

	    var ExecuteEncounter = Encounter.extend({
	        start: function(){
	            //Create Mother
	            var gangBossRoom = sge.random.item(this.block.rooms);
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
	                		['set', 'encounter.status',1]
	                }
	            });
	            gangBoss.tags.push('gangboss');
	            this.block.state.addEntity(gangBoss);
	        },
	        finish: function(){
	        	console.log('Complete Execute Gang Boss');
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
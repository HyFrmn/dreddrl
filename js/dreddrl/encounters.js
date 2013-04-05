define(['sge'], function(sge){
	var Encounter = sge.Class.extend({
		init: function(system){
			this.system = system;
			this.block = system.state.level;
			this.state = system.state;
			this.factory = this.block.factory;
			this.status = 0;
			this.total = 1;
			this.targetEntity = null;
			this.start();
		},
		isFinished: function(){
			return (this.status>=this.total);
		},
		start: function(){

		},
		finish: function(){
			this.system.complete(this);
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
		},
		add : function(comp){
			var entity = comp.entity;
			entity.addListener('target.set', function(){
				this.targetEntity = entity;
			}.bind(this));
			entity.addListener('target.remove', function(){
				this.targetEntity = null;
			}.bind(this));
			return this;
		}
	});

	var EncounterSystem = sge.Class.extend({
		init: function(state){
			this.state = state;
			this.encounters = [];
			this.active = null;
			this._index = 0;
		},
		create : function(klass){
			var encounter = new klass(this);
			this.encounters.push(encounter);
			if (!this.active){
				this.active = encounter;
			}
			return encounter;
		},
		getTargetEntity : function(){
			var entity = null;
			if (this.active){
				entity = this.active.targetEntity;
			}
			return entity;
		},
		_compass_tick : function(delta){
            var entity = this.getTargetEntity();
            if (entity){
            	var pc = this.state.getEntityWithTag('pc');
                coord = [entity.get('xform.tx'), entity.get('xform.ty')];
                var dx = coord[0] - pc.get('xform.tx');
                var dy = coord[1] - pc.get('xform.ty');
                var dist = Math.sqrt((dx*dx)+(dy*dy));
                var len = 640; //Math.min(dist, 640);
                var x1 = (pc.get('xform.tx'));
                var y1 = (pc.get('xform.ty')); 
                var x2 = entity.get('xform.tx')
                var y2 = entity.get('xform.ty')
                var top = 32 + this.state.game.renderer.ty;
                var bottom = (this.state.game.renderer.height-32) + this.state.game.renderer.ty;
                var left = 32 + this.state.game.renderer.tx;
                var right = (this.state.game.renderer.width-32) + this.state.game.renderer.tx;
                coords = [[left,top,right,top],[left,bottom,right,bottom],[left,top,left,bottom],[right,top,right,bottom]];
                var intersection = false;
                for (var i = coords.length - 1; i >= 0; i--) {
                    var coord = coords[i];
                    if (this._debug_tick){
                        var x3 = coord[0];
                        var y3 = coord[1];
                        var x4 = coord[2];
                        var y4 = coord[3];
                        var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                        var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                        console.log(x,y);
                        console.log(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
                    }
                    intersection = sge.collision.lineIntersect(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
                    if (intersection){
                        //console.log(intersection);
                        break;
                    }
                }; 
                if (intersection){
                    tx = intersection[0];
                    ty = intersection[1];
                    
                } else {
                    tx =  entity.get('xform.tx');
                    ty =  entity.get('xform.ty');
                }
                view = {
                    top : top,
                    bottom : bottom,
                    left : left,
                    right : right
                }
                if (sge.collision.pointRectIntersect(tx, ty, view)){
                    console.log('WTF!!!');
                }
                this.state.game.renderer.drawRect('canopy', tx-4, ty-4, 8, 8, {fillStyle: 'blue'}, 1000000);
            }
        },
		tick: function(){
			if (this.state.getEntitiesWithTag('pc').length<=0){
                    this.state.game.fsm.gameOver();
            }

            if (_.every(this.encounters, function(e){return e.isFinished()})){
                this.state.game.fsm.gameWin();
            }

            this._compass_tick();
		},
		complete: function(encounter){
			this._next = -1;
			this.switch();
		},
		next: function(){
			var activeEncounters = _.filter(this.encounters, function(e){return !e.isFinished()});
			this._index++;
			if (this._index>=activeEncounters.length){
				this._index=0;
			}
			return activeEncounters[this._index];
		},
		switch: function(){
			this.active = this.next();
		}
	})

	var CheckupEncounter = Encounter.extend({
	        start: function(){
	        	this.total = 3;
	            //Create Mother
	            var mothersRoom = this.block.getRandomEncounterRoom({territory: 'neutral'});
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
	                                ['set', 'encounter.status', 1],
                                    ['event', 'daughter', 'target.set']
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
	            this.targetEntity = mother;
	            

	            //Create Daughter
	            var daughtersRoom = this.block.getRandomEncounterRoom({exclude: [mothersRoom], territory: 'neutral'});
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
	                                ['set', 'encounter.status', 2],
                                    ['event', 'mother', 'target.set']
	                            ],[
	                                ['dialog', "Hey there. Haven't seen you around the block before."]
	                            ]
	                        ] 
	                }
	            });
	            daughter.tags.push('daughter');
	            this.block.state.addEntity(daughter);
	        },
	        finish: function(){
	        	this._super();
	        	var pc = this.getPC();
	        	pc.set('stats.xp', 50, 'add');
	        	this.state.log('Completed Checkup Encounter');
	        }
	    });

	    var ExecuteEncounter = Encounter.extend({
	        start: function(){
	            //Create Mother
	            var gangBossRoom = this.block.getRandomEncounterRoom({territory: 'albert'});
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
	            this.targetEntity = gangBoss;
	        },
	        finish: function(){
	        	this._super();
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
		EncounterSystem : EncounterSystem,
		ExecuteEncounter : ExecuteEncounter,
		CheckupEncounter : CheckupEncounter,
	}
})
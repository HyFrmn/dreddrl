define([
	'sge',
	'./components/weapons',
	'./components/physics',
	'./components/judgemovement',
	'./components/deaddrop',
	'./components/freeitem',
    './components/inventory',
    './components/interaction',
    './components/door',
    './components/actions',
    './components/elevator',
    './components/quest',
    './components/encounter',

    './actions/dialog',
    './actions/if',
    './actions/set',
    './actions/switch'
	], 
	function(sge){
		var FACTORYDATA = {
            chara : function(){return{
                xform : {},
                    sprite : {
                        width: 32,
                        offsetY: -8,
                        scale: 2
                    },
                    anim : {
                        frames: {
                            walk_down : [0,1,2],
                            walk_up : [9,10,11],
                            walk_right : [6,7,8],
                            walk_left : [3,4,5]
                        },
                    },
                    health : {alignment:5, life: 8},
                    physics : {},
                    inventory : {},
            }},
			pc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    controls : {},
                    sprite : {
                        src : 'assets/sprites/judge.png',
                    },
                    'judge.movement' : {
                        map: this.map,
                        speed: 64
                    },
                    health : {alignment:5, life: 10},
                    weapons: {},
                })},
            npc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    health : {alignment:0, life: 8},
                    movement : {
                        map: this.map,
                        speed: 16
                    },
                })},
            enemy : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/albert.png',
                },
                health : {alignment:-10, life: 3},
                simpleai : {},
                deaddrop: {}
            })},
            gangboss : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/albertbrownhair.png',
                },
                health : {alignment:-10, life: 6},
                simpleai : {},
                deaddrop: {}
            })},
            freeitem : function(){ return {
                xform: {},
                physics: {},
                sprite : {
                        src : 'assets/sprites/scifi_icons_1.png',
                        width: 24,
                        offsetY: 0,
                        scale: 2,
                    },
            }},
            gun : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                freeitem: {
                    'inventory.ammo': 5
                }
            })},
            rammen : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                sprite : {
                        frame: 123
                    },
                freeitem: {
                    'health.life' : 5
                }
            })},
            keycard : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                sprite : {
                        frame: 56
                    },
                freeitem: {
                    'inventory.add' : 'keycard.blue'
                }
            })},
            door : function(){return {
                xform: {},
                interact : {},
                door: {}
            }},
            elevator : function(){return {
                xform: {},
                interact : {},
                elevator: {}
            }},
            women : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_8.png',
                },
            })},
            oldwomen : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_4.png',
                },
            })},
            daughter : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_1.png',
                },
            })}
		}

		var deepExtend = function(destination, source) {
		  for (var property in source) {
		    if (source[property] && source[property].constructor &&
		     source[property].constructor === Object) {
		      destination[property] = destination[property] || {};
		      arguments.callee(destination[property], source[property]);
		    } else {
		      destination[property] = source[property];
		    }
		  }
		  return destination;
		};

		var Factory = function(type, options){
			options = options || {};
			var data = deepExtend(FACTORYDATA[type](), options);
			return new sge.Entity(data);
		}

		return Factory
	}
);
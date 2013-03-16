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
    './components/dialog',
    './components/elevator',
    './components/quest',

    './actions/dialog',
    './actions/if',
    './actions/set',
    './actions/switch'
	], 
	function(sge){
		var FACTORYDATA = {
			pc : function(){return{
                    xform : {},
                    controls : {},
                    sprite : {
                        src : 'assets/sprites/hunk.png',
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
                    'judge.movement' : {
                        map: this.map,
                        speed: 16
                    },
                    health : {alignment:5, life: 8},
                    physics : {},
                    inventory : {},
                    weapons: {},
                    quest: {}
                }},
            enemy : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/albert.png',
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
                movement : {
                    map: this.map,
                    speed: 16
                },
                health : {alignment:-10, life: 3},
                simpleai : {},
                physics : {},
                deaddrop: {}
            }},
            gangboss : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/albertbrownhair.png',
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
                movement : {
                    map: this.map,
                    speed: 16
                },
                health : {alignment:-20, life: 6},
                simpleai : {},
                physics : {},
                deaddrop: {}
            }},
            gun : function(){return {
                xform: {},
                physics: {},
                sprite : {
                        src : 'assets/sprites/scifi_icons_1.png',
                        width: 24,
                        offsetY: 0,
                        scale: 2,
                    },
                freeitem: {
                    'inventory.ammo': 5
                }
            }},
            rammen : function(){return {
                xform: {},
                physics: {},
                sprite : {
                        src : 'assets/sprites/scifi_icons_1.png',
                        width: 24,
                        offsetY: 0,
                        scale: 2,
                        frame: 123
                    },
                inventory: {ammo: 5},
                freeitem: {
                    'health.life' : 5
                }
            }},
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
            women : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/women_8.png',
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
                movement : {
                    map: this.map,
                    speed: 16
                },
                health : {alignment:1000, life: 5},
                physics : {},
                deaddrop: {},
                interact: {},
                dialog: {
                    "dialog":
                        ['switch', '${@(pc).quest.status}', 
                            [
                                ['dialog', "Please help me! I haven't seen my daughter all day. Can you find her and make sure she is ok. Thanks."],
                                ['set', '@(pc).quest.status', 1]
                            ],[
                                ['dialog', "Have you found my daughter yet?! I'm worried!"]
                            ],[
                                ['dialog', "Thank you for finding my daughter. Here take this for your trouble."],
                                ['set', '@(pc).quest.status', 3]
                            ],[
                                ['dialog', "Welcome to Peach Trees. "]
                            ]
                        ]
                    }
            }},
            daughter : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/women_1.png',
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
                movement : {
                    map: this.map,
                    speed: 16
                },
                health : {alignment:1000, life: 5},
                physics : {},
                deaddrop: {},
                interact: {},
                dialog: {
                    "dialog":
                        ['if', '${@(pc).quest.status}==1', 
                            [
                                ['dialog', "Yes, I'm doing fine. Tell my mom I'm fine."],
                                ['set', '@(pc).quest.status', 2]
                            ],[
                                ['dialog', "Hey there. Haven't seen you around the block before."]
                            ]
                        ]
                }
            }}
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
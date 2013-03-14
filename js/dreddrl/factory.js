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
    './components/dialog'
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
                    health : {alignment:'good', life: 8},
                    physics : {},
                    inventory : {},
                    weapons: {},
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
                health : {alignment:'evil', life: 3},
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
            women : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/women.png',
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
                health : {alignment:'good', life: 5},
                physics : {},
                deaddrop: {},
                interact: {},
                dialog: {dialog: "Please help me! I haven't seen my daughter all day. Can you find her and make sure she is ok. Thanks."}
            }},
            daughter : function(){return {
                xform : {},
                sprite : {
                    src : 'assets/sprites/women.png',
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
                health : {alignment:'good', life: 5},
                physics : {},
                deaddrop: {},
                interact: {},
                dialog: {
                    dialog: "Yes, I'm fine. Go tell my Mom to stop worrying."
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
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
    './components/stats',
    './components/health',
    './components/simpleai',
    './components/emote',
    './components/judgecontrols',

    './actions/dialog',
    './actions/if',
    './actions/set',
    './actions/switch',
    './actions/event'
	], 
	function(sge){
        var NPCSHEETS = [
            'gang_1',
            'gang_2',
            'gang_6',
            'women_1',
            'women_2',
            'women_3',
            'women_4',
            'women_5',
            'women_6',
            'women_7',
            'women_8',
        ];


		var FACTORYDATA = {
            chara : function(){return{
                xform : { container: '_entityContainer'},
                sprite : {
                    width: 32,
                    offsetY: -8,
                    scale: 1
                },
                anim : {
                    frames: {
                        walk_down : [0,1,2],
                        walk_up : [9,10,11],
                        walk_right : [6,7,8],
                        walk_left : [3,4,5]
                    },
                },
                physics : {},
                inventory : {},
            }},
			pc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    'judge.controls' : {},
                    sprite : {
                        src : 'assets/sprites/judge.png',
                    },
                    'judge.movement' : {
                        map: this.map,
                        speed: 64
                    },
                    health : {alignment:5, life: 10},
                    weapons: {rps: 10},
                    stats: {},
                    emote: {},
                })},
            npc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    movement : {
                        map: this.map,
                        speed: 16
                    },
                    simpleai: {territory: 'neutral'},
                    health : {alignment:0, life: 1},
                    sprite : {
                        src : 'assets/sprites/' + sge.random.item(NPCSHEETS) +'.png',
                    },
                })},
            enemy : function(){
                var msgs = [
                    'I am the law.',
                    'Objection noted.',
                    'Sentence. Execution!',
                    "You've been found guilt.",
                    'One less Lawbreaker.'
                ]
                return deepExtend(FACTORYDATA['npc'](), {
                    sprite : {
                        src : 'assets/sprites/albert.png',
                    },
                    health : {alignment:-10, life: 3},
                    simpleai : { tracking: 'pc', territory: 'albert'},
                    deaddrop: {items:['key','gun','rammen']},
                    actions: {
                        kill : ['switch', 0, [['set','@(pc).stats.xp', 5, 'add'],['event', 'pc', 'emote.msg', sge.random.item(msgs), 3]]]
                    },
                    weapons: {rps: 2}
                }
            )},
            gangboss : function(){return deepExtend(FACTORYDATA['enemy'](), {
                sprite : {
                    src : 'assets/sprites/albertbrownhair.png',
                },
                weapons: {rps: 4},
                health : {alignment:-10, life: 6},
                deaddrop: {count: 2, always: ['key','key','key']},
                actions: {
                    kill : ['switch', 0, [['set','@(pc).stats.xp', 25, 'add'],['event', 'pc', 'emote.msg', 'Goodbye Albert.', 5]]]
                },
            })},
            freeitem : function(){ return {
                xform: { container: '_entityContainer'},
                physics: {},
                sprite : {
                    src : 'assets/sprites/scifi_icons_1.png',
                    width: 24,
                    offsetY: 0,
                    scale: 2,
                    frame: 1
                },

            }},
            gun : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                freeitem: {
                    'inventory.ammo': 10,
                    'name' : 'Gun'
                }
            })},
            rammen : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                sprite : {
                        frame: 123
                },
                freeitem: {
                    'health.life' : 5,
                    'name' : 'Ramen'
                }
            })},
            key : function(){return  deepExtend(FACTORYDATA['freeitem'](), {
                sprite : {
                        frame: 57
                },
                freeitem: {
                    'inventory.keys' : 1,
                    'name' : 'Key'
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
                xform: { container: '_entityContainer'},
                interact : {},
                door: {}
            }},
            elevator : function(){return {
                xform: { container: '_entityContainer'},
                interact : {},
                elevator: {}
            }},
            man: function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/gang_' + sge.random.item([1,2,6]) +'.png',
                },
            })},
            'woman.old' : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_' + sge.random.item([4,8]) +'.png',
                },
            })},
            'woman' : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_' + sge.random.item([2,3,6,7]) +'.png',
                },
            })},
            'woman.young' : function(){return deepExtend(FACTORYDATA['npc'](), {
                sprite : {
                    src : 'assets/sprites/women_' + sge.random.item([1,5]) +'.png',
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

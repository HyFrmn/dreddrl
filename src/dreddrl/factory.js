define([
	'sge',
	'./components/weapons',
	'./components/physics',
	'./components/freeitem',
    './components/inventory',
    './components/interaction',
    './components/chara',
    './components/highlight',
    './components/door',
    './components/actions',
    './components/dialog',
    './components/elevator',
    './components/quest',
    './components/encounter',
    './components/stats',
    './components/health',
    './components/ai',
    './components/emote',
    './components/judgecontrols',
    './components/computer',
    './components/container',
    './components/tilecache',

    './actions/dialog',
    './actions/if',
    './actions/set',
    './actions/switch',
    './actions/event',
    './actions/list',
    './actions/followpath',
    './actions/inventory'
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

        var ITEMTYPE_P = [];
        [['ramen',30],['gun',30],['key',15],['medkit',5],['smack',3],['phone',3],['ace.spades',1],['ace.hearts',1]].forEach(function(foo){
            for (var i = foo[1] - 1; i >= 0; i--) {
                ITEMTYPE_P.push(foo[0])
            };
        });

        var getRandomItemType = function(){
            var typ = sge.random.item(ITEMTYPE_P);
            return typ;
        }

		var FACTORYDATA = {
            chara : function(){return{
                xform : { container: '_entityContainer', offsetX: -16, offsetY:-16},
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
                chara: {},
                emote: {},
                stats: {}
            }},
			pc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    'judge_controls' : {},
                    sprite : {
                        src : 'assets/sprites/judge.png',
                    },
                    movement : {
                        map: this.map,
                        speed: 196
                    },
                    health : {alignment:5, life: 100},
                    combat: {faction: 'judge', weapon: 'lawgiver'},
                    stats: {
                        xp: 0,
                        level: 1,
                        faction: 'judge'
                    }
                })},
            npc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    movement : {
                        map: this.map,
                        speed: 96
                    },
                    highlight: {},
                    health : {alignment:0, life: 8},
                    sprite : {
                        src : 'assets/sprites/' + sge.random.item(NPCSHEETS) +'.png',
                    },
                })},
            citizen : function(){return deepExtend(FACTORYDATA['npc'](), {
                    ai : {
                        
                    },
                    stats : {
                        faction: 'citizen'
                    }
                })},
            resident : function(){return deepExtend(FACTORYDATA['citizen'](), {
                    ai : {
                        behaviour: 'resident'
                    },
                })},
            'citizen.boring' : function(){return deepExtend(FACTORYDATA['citizen'],{
                dialog : {
                        tree: [{

                                topic:"Who are you?",
                                dialog:[{entity: 'npc',  text: "I'm a registered citizen."}],
                                choices: [
                                    {
                                        topic:"Do you live in this block?",
                                        dialog: [{entity: 'npc', text:"Yes and I work here."}]
                                    },
                                    {
                                        topic:"Do you need assistance?",
                                        dialog: [{entity: 'npc', text:"No. Everything is fine."}]
                                    },
                                    {
                                        topic:"Goodbye"
                                    }
                                ]
                               }]
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
                    emote: {},
                    health : {alignment:-10, life: 8},
                    ai : { behaviour: 'enemy' },
                    //deaddrop: {items:['key','gun','ramen','ramen','ramen']},
                    combat: {faction : 'lawbreak'},
                    stats: {
                        xp: Math.round(sge.random.range(2,4)),
                        level: 1,
                        cash: Math.round(sge.random.range(5, 25))
                    },
                    inventory: {
                        items: [getRandomItemType()]
                    }
                }
            )},
            lawbreaker : function(){return deepExtend(FACTORYDATA['enemy'](), {
                sprite : {
                    src : 'assets/sprites/albert.png',
                },
                stats : {
                    faction : 'lawbreaker'
                }
            })},
            spacer : function(){return deepExtend(FACTORYDATA['enemy'](), {
                sprite : {
                        src : 'assets/sprites/punk_' + sge.random.item([1,2,3]) +'.png',
                    },
                stats : {
                    faction : 'spacer'
                }
            })},
            'object' : function(){return {
                xform: { container: '_entityContainer'},
                tilecache: {}
            }},
            trigger : function(){ return{
                xform: { container: '_entityContainer'},
                physics: {
                    type: 2 //Static
                }
            }},
            freeitem : function(){ return {
                xform: { container: '_entityContainer'},
                physics: {},
                sprite : {
                    src : 'assets/sprites/scifi_icons_1.png',
                    width: 24,
                    scale: 2,
                    frame: 1,
                    offsetX: -12,
                    offsetY: -12
                },

            }},
            computer: function(){return {
                xform: { container: '_entityContainer' },
                interact: {
                    targets: [[0,0]]
                },
                highlight: {
                    radius: 18
                },
                computer:{},
                sprite: {
                    src: 'computer',
                    width: 32,
                    height: 64,
                    frame: 0,
                    offsetX: -16,
                    offsetY: -48
                },
                anim : {
                    frames: {
                        on : { frames: [0,1,2,3,4,5], loop: false},
                        off: { frames: [5,4,3,2,1,0], loop: false}
                    },
                }
            }},
            shelf: function(){return {
                xform: { container: '_entityContainer' },
                interact: {
                    targets: [[0,0]]
                },
                container: {
                    fullFrame: 6,
                    emptyFrame: 8
                },
                inventory: {
                    items: [getRandomItemType(),getRandomItemType(),getRandomItemType()]
                },
                highlight: {
                    radius: 18
                },
                physics: {
                    type: 2 //static
                },
                sprite: {
                    src: 'shelves',
                    width: 32,
                    height: 64,
                    frame: sge.random.rangeInt(0,8),
                    offsetX: -16,
                    offsetY: -48
                }
            }},
            door : function(){return {
                xform: { container: '_entityContainer'},
                highlight: {radius: 32},
                interact : {
                    targets: [[0,32],[0,-32]]
                },
                door: {}
            }},
            elevator : function(){return {
                xform: { container: '_entityContainer'},
                interact : {},
                highlight: {radius: 48},
                elevator: {},
                sprite: {
                    src : 'elevator',
                    width: 96,
                    height: 96,
                    frame: 0,
                    offsetX: -48,
                    offsetY: -64
                },
                anim : {
                    frames: {
                        open : { frames: [0,1,2,3], loop: false},
                        close: { frames: [3,2,1,0], loop: false}
                    },
                }
            }},
            impact: function(){
                return {
                    xform: { container: '_entityContainer'},
                    sprite: {
                        src: 'laser_hit',
                        width: 32,
                        height: 32,
                        offsetX: -16,
                        offsetY: -16,
                        frame: 0
                    },
                    anim: {
                        frames: {
                            "hit" : {frames: [0,1,2,3,4,5,6,7], loop: false}
                        },
                        fps: 30
                    }
                }
            },
            man: function(){return deepExtend(FACTORYDATA['citizen'](), {
                sprite : {
                    src : 'assets/sprites/gang_' + sge.random.item([1,2,6]) +'.png',
                },
            })},
            'woman.old' : function(){return deepExtend(FACTORYDATA['citizen'](), {
                sprite : {
                    src : 'assets/sprites/women_' + sge.random.item([4,8]) +'.png',
                },
            })},
            'woman' : function(){return deepExtend(FACTORYDATA['citizen'](), {
                sprite : {
                    src : 'assets/sprites/women_' + sge.random.item([2,3,6,7]) +'.png',
                },
            })},
            'woman.young' : function(){return deepExtend(FACTORYDATA['citizen'](), {
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

        var DreddRLEntity = sge.Entity.extend({
            init: function(data){
                this._contexts = [];
                this._regions = [];
                this._super(data);
                this.meta = {};
            },
            addContext: function(ctx){
                this._contexts.push(ctx)
            },
            getContext: function(){
                var ctx = {};
                this._contexts.forEach(function(context){
                    for (key in context){
                        ctx[key] = context[key];
                    }
                })
                return ctx;
            }
        });

		var Factory = function(type, options){
			options = options || {};
            var data = options;
            if (type){
    			data = deepExtend(FACTORYDATA[type](), options);
            }
            entity = new DreddRLEntity(data);
            entity.name = type;
			return entity;
		}

		return Factory
	}
);

define([
	'sge',
	'./components/weapons',
	'./components/physics',
	'./components/judgemovement',
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
    './components/simpleai',
    './components/enemyai',
    './components/emote',
    './components/judgecontrols',
    './components/navigate',

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
                chara: {},
                navigate: {}
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
                    health : {alignment:5, life: 100},
                    combat: {faction: 'judge', weapon: 'lawgiver'},
                    stats: {},
                    emote: {},
                })},
            npc : function(){return deepExtend(FACTORYDATA['chara'](), {
                    movement : {
                        map: this.map,
                        speed: 16
                    },
                    health : {alignment:0, life: 8},
                    sprite : {
                        src : 'assets/sprites/' + sge.random.item(NPCSHEETS) +'.png',
                    },
                    emote : {}
                })},
            citizen : function(){return deepExtend(FACTORYDATA['npc'](), {
                    interact : {},
                    dialog : {
                        tree: [{
                                pc:"Who are you?",
                                npc: "I'm a registered citizen.",
                                choices: [
                                    {
                                        pc:"Do you live in this block?",
                                        npc:"Yes and I work here."
                                    },
                                    {
                                        pc:"Do you need assistance?",
                                        npc:"No. Everything is fine."
                                    },
                                    {
                                        pc:"Goodbye"
                                    }
                                ]
                               }]
                    },
                    enemyai : {
                        
                    },
                })},
            lawbreaker : function(){
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
                    enemyai : { tracking: 'pc', territory: 'albert', xp: 1, faction: 'westsider'},
                    //deaddrop: {items:['key','gun','ramen','ramen','ramen']},
                    combat: {faction : 'lawbreak'},
                }
            )},
            gangboss : function(){return deepExtend(FACTORYDATA['lawbreaker'](), {
                sprite : {
                    src : 'assets/sprites/albertbrownhair.png',
                },
                health : {alignment:-10, life: 24},
                //deaddrop: {count: 2, always: ['key','key','key']},
            })},
            spacer : function(){
                var msgs = [
                    'I am the law.',
                    'Objection noted.',
                    'Sentence. Execution!',
                    "You've been found guilt.",
                    'One less Lawbreaker.'
                ]
                return deepExtend(FACTORYDATA['npc'](), {
                    sprite : {
                        src : 'assets/sprites/punk_' + sge.random.item([1,2,3]) +'.png',
                    },
                    emote: {},
                    health : {alignment:-10, life: 5},
                    enemyai : { tracking: 'pc', territory: 'spacer', xp: 1, faction: 'spacer'},
                    //deaddrop: {items:['key','gun','ramen','ramen','ramen']},
                    combat: {faction : 'spacer'},
                }
            )},
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
            door : function(){return {
                xform: { container: '_entityContainer'},
                highlight: {radius: 48},
                interact : {},
                door: {}
            }},
            elevator : function(){return {
                xform: { container: '_entityContainer'},
                interact : {},
                elevator: {}
            }},
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
			return new DreddRLEntity(data);
		}

		return Factory
	}
);

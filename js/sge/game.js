define(['jquery', 'sge/lib/class' , 'sge/vendor/state-machine','sge/engine','sge/gamestate', 'sge/input','sge/renderer', 'sge/vendor/pxloader'],
function($, Class, StateMachine, Engine, GameState, Input, Renderer, PxLoader, PxLoaderImage){
    var LoadState = GameState.extend({
        initState: function(){
            this.elem = $('.loadscreen');
            if (this.elem.length==0){
                this.elem = $('<div/>').addClass("loadscreen gamestatescreen");
                this.elem.append($('<img class="loader" src="js/sge/images/ajax-loader.gif"/>'));
                this.game.elem.append(this.elem);
            }
        },
        startState : function(){
            this._super();
            if (this.game._states['game'].loader){
                this.game._states['game'].loader.start();
            }
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeOut();
            }
        }
    });

    var MainMenuState = GameState.extend({
        initState: function(){
            this.elem = $('.mainmenuscreen');
            if (this.elem.length==0){
                this.elem = $('<div/>').addClass("mainmenuscreen gamestatescreen");
                this.elem.append($('<p>Press Enter to Start Game</p>'));
                this.game.elem.append(this.elem);
            }
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game, 'Game');
                this.game.fsm.startGame();    
            }.bind(this);
            this.startState();
            this.input.addListener('keydown:enter', this.startGame);
        },
        startState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){

        }
    })

    var GameOverState = GameState.extend({
        initState: function(){
            this.elem = $('.gameoverscreen') || null;
            if (this.elem.length==0){
                this.elem = $('<div/>').addClass("gameoverscreen gamestatescreen");
                this.elem.append($('<h1>Game Over</h1><p>Press Enter to Continue.</p>'));
                this.game.elem.append(this.elem);
            }
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
            this.input.addListener('keydown:enter', this.startGame);
        },
        startState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
            //this.input.removeListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){

        }
    })

    var GameWinState = GameState.extend({
        initState: function(){
            this.elem = $('.gamewinscreen');
            if (this.elem.length==0){
                this.elem = $('<div/>').addClass("gamewinscreen gamestatescreen");
                this.elem.append($('<h1>You Win!</h1><p>Press Enter to Continue.</p>'));
                this.game.elem.append(this.elem);
            }
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
            this.input.addListener('keydown:enter', this.startGame);
        },
        startState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){

        }
    })

    var PauseState = GameState.extend({
        initState: function(){
            this.elem = $('.pausescreen');
            if (this.elem.length==0){
                this.elem = $('<div/>').addClass("pausescreen gamestatescreen");
                this.elem.append($('<h1>Paused</h1>'));
                this.game.elem.append(this.elem);
            }
            this.unpause = function(){
                this.game.fsm.unpause();
            }.bind(this);
            this.input.addListener('keydown:space', this.unpause);
        },
        startState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){
            func = this.game._states['game']._paused_tick;
            if (func){
                func.call(this.game._states['game'], delta);
            }
        }
    });

    var DefaultGame = GameState.extend({
        initState: function(){
            setTimeout(function(){
                this.game.fsm.finishLoad();
                setTimeout(function(){
                    this.game.fsm.gameWin();
                }.bind(this), 5000);
            }.bind(this), 1000)
        }
    })

    var Game = Class.extend({
        init: function(options){
            this.options = $.extend({
                elem: null
            }, options || {});
            this.engine = new Engine();
            this.loader = new PxLoader();
            this.input = new Input();
            this._tick = 0;
            this._last = 0;
            this._lastRender = 0;
            this._gameState = DefaultGame;
            this._debugElem = $('.fps');
            if (this.options.elem!==null){
                this.elem = $(this.options.elem);
            } else {
                console.log('[SGE ERROR] Need an element to render in. Use elem option to constructor.')
                this.elem = null;
            }
            this.renderer = new Renderer(this.elem);
            this.engine.tick = function(delta){
                this.tick(delta);
            }.bind(this);

            this.fsm = StateMachine.create({
                initial: 'mainmenu',
                events: [
                    {name: 'startLoad', from: ['game','menu','mainmenu'], to:'loading'},
                    {name: 'finishLoad', from: 'loading', to: 'game'},
                    {name: 'pause', from: 'game', to:'paused'},
                    {name: 'unpause', from: ['paused','menu'], to:'game'},
                    {name: 'startGame', from: 'mainmenu', to:'loading'},
                    {name: 'loadMainMenu', from: ['game','gameover','gamewin','menu','pause'], to: 'mainmenu'},
                    {name: 'gameOver', from: 'game', to: 'gameover'},
                    {name: 'gameWin', from: 'game', to:'gamewin'},
                    {name: 'startDialog', from: 'game', to:'dialog'},
                    {name: 'endDialog', from:'dialog', to:'game'}
                ],
                callbacks: {
                    onleavestate: function(evt, from, to){
                        if (from=="none"){return};
                        //console.log('Leaving:', from)
                        this._states[from].endState(evt, from, to);
                    }.bind(this),
                    onenterstate: function(evt, from, to){
                        if (from=="none"){return};
                        //console.log('Entering:', to)
                        this._states[to].startState(evt, from, to);
                        this.state = this._states[to];
                    }.bind(this)
                }
            });

            this._states = {
                'game' : null,
                'mainmenu' : new MainMenuState(this, 'Main Menu'),
                'loading' : new LoadState(this, 'Loading'),
                'paused' : new PauseState(this, 'Paused'),
                'gameover' : new GameOverState(this, 'Game Over'),
                'gamewin' : new GameWinState(this, 'Game Win')
            }
            this.state = this._states['loading'];
            this.initGame(options);
        },
        setGameState : function(StateClass){
            this._gameState = StateClass
        },
        addState: function(label, value){
            this._states[label] = value;
            return value;
        },
        initGame: function(){},
        preRender: function(){},
        postRender: function(){},
        tick: function(delta){
            this.input.tick();
            if (this.state!=null){
                this.state.tick(delta);
            } else {
                //Do Something;
            }
            this.renderer.render();
            
            this._tick++;
            if (this._tick>10){
                this._tick = 0;
                this._debugElem.text(1 / delta);
            }
        },
        start: function(){
            window.onblur = function(){
                this.fsm.pause();
            }.bind(this);
            this.engine.run()
        }
    });

    return Game;
});

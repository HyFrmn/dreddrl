define(['jquery', './lib/class' , './vendor/state-machine','./engine','./gamestate', './input','./renderer', './vendor/pxloader'],
function($, Class, StateMachine, Engine, GameState, Input, Renderer, PxLoader, PxLoaderImage){
    var LoadState = GameState.extend({
        initState: function(){
            this.elem = $('.loadscreen') || null;
        },
        startState : function(){
            if (this.game._states['game'].loader){
                this.game._states['game'].loader.start();
            }
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            if (this.elem){
                this.elem.fadeOut();
            }
        }
    });

    var MainMenuState = GameState.extend({
        initState: function(){
            this.elem = $('.mainmenuscreen') || null;
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.startGame();    
            }.bind(this);
            this.startState()
        },
        startState : function(){
            this.input.addListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this.input.removeListener('keydown:enter', this.startGame);
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
            this.startGame = function(){
                console.log('START')
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
        },
        startState : function(){
            this.input.addListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this.input.removeListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){

        }
    })

    var GameWinState = GameState.extend({
        initState: function(){
            this.elem = $('.gamewinscreen') || null;
            this.startGame = function(){
                console.log('START')
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
        },
        startState : function(){
            this.input.addListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this.input.removeListener('keydown:enter', this.startGame);
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        tick : function(delta){

        }
    })

    var PauseState = GameState.extend({
        initState: function(){
            this.elem = $('.pausescreen') || null;
            this.unpause = function(){
                this.game.fsm.unpause();
            }.bind(this);
        },
        startState : function(){
            this.input.addListener('keydown:space', this.unpause);
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this.input.removeListener('keydown:space', this.unpause);
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

    var Game = Class.extend({
        init: function(options){
            this.engine = new Engine();
            this.loader = new PxLoader();
            this.input = new Input();
            this._tick = 0;
            this._last = 0;
            this._debugElem = $('.fps');
            this.renderer = new Renderer('#game');
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
                        console.log('Leaving:', from)
                        this._states[from].endState(evt, from, to);
                    }.bind(this),
                    onenterstate: function(evt, from, to){
                        if (from=="none"){return};
                        console.log('Entering:', to)
                        this._states[to].startState(evt, from, to);
                        this.state = this._states[to];
                    }.bind(this)
                }
            });

            this._states = {
                'game' : null,
                'mainmenu' : new MainMenuState(this),
                'loading' : new LoadState(this),
                'paused' : new PauseState(this),
                'gameover' : new GameOverState(this),
                'gamewin' : new GameWinState(this)
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

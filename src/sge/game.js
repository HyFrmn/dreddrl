define(['sge/vendor/underscore', 'sge/lib/util','sge/lib/class' ,'sge/vendor/caat', 'sge/vendor/state-machine','sge/engine','sge/gamestate', 'sge/input','sge/renderer', 'sge/vendor/virtualjoystick','sge/vendor/pxloader'],
function(_, util, Class, CAAT, StateMachine, Engine, GameState, Input, Renderer, VirtualJoystick, PxLoader, PxLoaderImage){
    var LoadState = GameState.extend({
        initState: function(){
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Loading').setLocation(width/2,height/2);
            this.bar = new CAAT.ShapeActor().setSize(200,8).setLocation((width/2) -100,(height/2) + 32).setFillStyle('white').setShape(CAAT.ShapeActor.SHAPE_RECT);
            this.scene.addChild(title);
            this.scene.addChild(this.bar);
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
        updateProgress: function(pct){
            this.bar.setSize(200*pct,8);
        }
    });

    var MainMenuState = GameState.extend({
        initState: function(){
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Game').setLocation(width/2,height/2);
            var instruct = new CAAT.TextActor().setText('Press Enter to Start')
            this.scene.addChild(title);
            this.scene.addChild(instruct);
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game, 'Game');
                this.game.fsm.startLoad();    
            }.bind(this);
            this.startState();
            this.input.addListener('keydown:enter', this.startGame);
            this.input.addListener('tap', this.startGame);
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
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Game Over').setLocation(width/2,height/2);
            //var instruct = new CAAT.TextActor().setText('Press Enter to Start')
            this.scene.addChild(title);
            //this.scene.addChild(instruct);
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
            this.input.addListener('keydown:enter', this.startGame);
            this.input.addListener('tap', this.startGame);
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
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Win').setLocation(width/2,height/2);
            //var instruct = new CAAT.TextActor().setText('Press Enter to Start')
            this.scene.addChild(title);
            //this.scene.addChild(instruct);
            this.startGame = function(){
                this.game._states['game'] = new this.game._gameState(this.game);
                this.game.fsm.loadMainMenu();
            }.bind(this);
            this.input.addListener('keydown:enter', this.startGame);
            this.input.addListener('tap', this.startGame);
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
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Paused').setLocation(width/2,height/2);
            var instruct = new CAAT.TextActor().setText('Press Enter to Start').setLocation(width/2,height/2) + 32;
            this.scene.addChild(title);
            //this.scene.addChild(instruct);
            this.unpause = function(){
                this.game.fsm.unpause();
            }.bind(this);
            this.input.addListener('keydown:space', this.unpause);
            this.input.addListener('tap', this.unpause);
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
            this.options = util.extend({
                elem: null,
                pauseState : PauseState,
                mainMenuState : MainMenuState,
                width: 720,
                height: 540,
                fps: 60
            }, options || {});
            this.engine = new Engine();
            this.loader = new PxLoader();
            this.input = new Input(document.getElementById('game'));
            this.data = {};
            this._tick = 0;
            this._last = 0;
            this._lastRender = 0;
            this._gameState = DefaultGame;

            this.renderer = new CAAT.Director().initialize(this.options.width, this.options.height,options.elem);

            //this.renderer.onRenderStart= function(director_time) {console.log('tick',this.renderer.scenes.indexOf(this.renderer.currentScene))}.bind(this);
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
                    {name: 'loadMainMenu', from: ['game','gameover','gamewin','menu','pause'], to: 'mainmenu'},
                    {name: 'gameOver', from: 'game', to: 'gameover'},
                    {name: 'gameWin', from: 'game', to:'gamewin'},
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
                'mainmenu' : new this.options.mainMenuState(this, 'Main Menu'),
                'loading' : new LoadState(this, 'Loading'),
                'paused' : new this.options.pauseState(this, 'Paused'),
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
        finishLoad : function(){
            setTimeout(function(){this.fsm.finishLoad()}.bind(this), 250);
        },
        initGame: function(){},
        preRender: function(){},
        postRender: function(){},
        tick: function(delta){
            this.input.tick();
            if (this.state!=null){
                this.state._time += delta;
                this.state.tick(delta);
            } else {
                //Do Something;
            }
        },
        start: function(){
            window.onblur = function(){
                this.fsm.pause();
            }.bind(this);
            this.engine.run(this.options.fps);
            CAAT.loop(this.options.fps);
        }
    });

    return Game;
});

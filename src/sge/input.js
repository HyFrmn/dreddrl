define(
    ['sge/lib/class',
    'sge/observable',
    'sge/gamecontroller'],
function(Class, Observable, Hammer){
	var KEYCODES = {
        "backspace" : 8,
        "tab" : 9,
        "enter" : 13,
        "shift" : 16,
        "ctrl" : 17,
        "alt" : 18,
        "pause" : 19,
        "capslock" : 20,
        "escape" : 27,
        "space" : 32,
        "pageup" : 33,
        "pagedown" : 34,
        "end" : 35,
        "home" : 36,
        "left" : 37,
        "up" : 38,
        "right" : 39,
        "down" : 40,
        "insert" : 45,
        "delete" : 46,
        "0" : 48,
        "1" : 49,
        "2" : 50,
        "3" : 51,
        "4" : 52,
        "5" : 53,
        "6" : 54,
        "7" : 55,
        "8" : 56,
        "9" : 57,
        "A" : 65,
        "B" : 66,
        "C" : 67,
        "D" : 68,
        "E" : 69,
        "F" : 70,
        "G" : 71,
        "H" : 72,
        "I" : 73,
        "J" : 74,
        "K" : 75,
        "L" : 76,
        "M" : 77,
        "N" : 78,
        "O" : 79,
        "P" : 80,
        "Q" : 81,
        "R" : 82,
        "S" : 83,
        "T" : 84,
        "U" : 85,
        "V" : 86,
        "W" : 87,
        "X" : 88,
        "Y" : 89,
        "Z" : 90,
        "left-window-key" : 91,
        "right-window-key" : 92,
        "select" : 93,
        "numpad0" : 96,
        "numpad1" : 97,
        "numpad2" : 98,
        "numpad3" : 99,
        "numpad4" : 100,
        "numpad5" : 101,
        "numpad6" : 102,
        "numpad7" : 103,
        "numpad8" : 104,
        "numpad9" : 105,
        "multiply" : 106,
        "add" : 107,
        "subtract" : 109,
        "decimal-point" : 110,
        "divide" : 111,
        "F1" : 112,
        "F2" : 113,
        "F3" : 114,
        "F4" : 115,
        "F5" : 116,
        "F6" : 117,
        "F7" : 118,
        "F8" : 119,
        "F9" : 120,
        "F10" : 121,
        "F11" : 122,
        "F12" : 123,
        "numlock" : 144,
        "scrolllock" : 145,
        "semi-colon" : 186,
        "equals" : 187,
        "comma" : 188,
        "dash" : 189,
        "period" : 190,
        "slash" : 191,
        "accent" : 192,
        "lbracket" : 219,
        "backslash" : 220,
        "rbraket" : 221,
        "singlequote" : 222
    };

    var REVERSE_KEYCODES = {};
    var keys = Object.keys(KEYCODES);
    for (var i=0; i<keys.length; i++){
        var key = keys[i];
        var value = KEYCODES[key];
        REVERSE_KEYCODES[value] = key;
    }

    var InputProxy = Observable.extend({
        init: function(input){
            this._super();
            this._input = input
            this.enable = false;
            this.joystick = input.joystick;
        },
        fireEvent: function(){
            var args = Array.prototype.slice.call(arguments);
            if (this.enable){
                this._super.apply(this, args);
            }
        },
        isPressed: function(keyCode){
            return this._input.isPressed(keyCode);
        },
        dpad: function(){
            var xaxis = 0;
            var yaxis = 0;
            if (this.joystick){
                if (this.joystick.down()){
                    yaxis++;
                }
                if (this.joystick.up()){
                    yaxis--;
                }
                if (this.joystick.right()){
                    xaxis++;
                }
                if (this.joystick.left()){
                    xaxis--;
                }
            } else {
                if (this.isPressed('down')){
                    yaxis++;
                }
                if (this.isPressed('up')){
                    yaxis--;
                }
                if (this.isPressed('right')){
                    xaxis++;
                }
                if (this.isPressed('left')){
                    xaxis--;
                }
            }
            return [xaxis, yaxis];
        }
    });

	var Input = Observable.extend({
		init: function(elem){
            this._elem = document.body
            this._super()
			this._isNewKeyDown = {}
            this._isKeyDown = {};
            this._proxies = [];
            this._events = [];
            this.joystick = null;
            var cvs = document.getElementById('game');
            if ('ontouchstart' in window){
                var options = {
                    canvas: 'game',
                    left:{
                        dpad: {
                            down: {
                                touchStart: function(){
                                    this.keyDownCallback({keyCode: KEYCODES['down']})
                                }.bind(this),
                                touchEnd: function(){
                                    this.keyUpCallback({keyCode: KEYCODES['down']})
                                }.bind(this)
                            },
                            up: {
                                touchStart: function(){
                                    this.keyDownCallback({keyCode: KEYCODES['up']})
                                }.bind(this),
                                touchEnd: function(){
                                    this.keyUpCallback({keyCode: KEYCODES['up']})
                                }.bind(this)
                            },
                            left: {
                                touchStart: function(){
                                    this.keyDownCallback({keyCode: KEYCODES['left']})
                                }.bind(this),
                                touchEnd: function(){
                                    this.keyUpCallback({keyCode: KEYCODES['left']})
                                }.bind(this)
                            },
                            right: {
                                touchStart: function(){
                                    this.keyDownCallback({keyCode: KEYCODES['right']})
                                }.bind(this),
                                touchEnd: function(){
                                    this.keyUpCallback({keyCode: KEYCODES['right']})
                                }.bind(this)
                            }
                        }
                    },
                    right: { 
                                type: 'buttons', 
                                position: { right: '17%', bottom: '28%' }, 
                                buttons: [
                                        { offset: { x: '-13%', y: 0 }, label: 'X', radius: '7%', stroke: 2, backgroundColor: 'blue', fontColor: '#fff', touchStart: function() {
                                                // Blue is currently mapped to up button
                                                this.keyDownCallback({keyCode: KEYCODES['z']});
                                        }.bind(this), touchEnd: function() {
                                                this.keyUpCallback({keyCode: KEYCODES['z']});      
                                        }.bind(this) },
                                        { offset: { x: 0, y: '-11%' }, label: 'Y', radius: '7%', stroke: 2, backgroundColor: 'yellow', fontColor: '#fff', touchStart: function() {
                                                this.keyDownCallback({keyCode: KEYCODES['x']});
                                        }.bind(this), touchEnd: function() {
                                                this.keyUpCallback({keyCode: KEYCODES['x']});                                                
                                        }.bind(this)  },
                                        { offset: { x: '13%', y: 0 }, label: 'B', radius: '7%', stroke: 2, backgroundColor: 'red', fontColor: '#fff', touchStart: function() {
                                                this.keyDownCallback({keyCode: KEYCODES['enter']});
                                        }.bind(this), touchEnd: function() {
                                                this.keyUpCallback({keyCode: KEYCODES['enter']});                                              
                                        }.bind(this) },
                                        { offset: { x: 0, y: '11%' }, label: 'A', radius: '7%', stroke: 2, backgroundColor: 'green', fontColor: '#fff', touchStart: function() {
                                                this.keyDownCallback({keyCode: KEYCODES['space']});
                                        }.bind(this), touchEnd: function() {
                                                this.keyUpCallback({keyCode: KEYCODES['space']});       
                                        }.bind(this)  }
                                ],
                    }
                };

                
                setTimeout(function(){
                    GameController.init( options );
                    console.log('Controller', GameController.canvas.width,  GameController.canvas.height)
                }, 3000);
            } 
            if ('onkeydown' in window) {
                window.onkeydown = this.keyDownCallback.bind(this);
                window.onkeyup = this.keyUpCallback.bind(this);
            }
            //
        },
        tapCallback : function(e){
            this._events.push('tap');
        },
        keyDownCallback : function(e){
            //console.log('keydown:' + REVERSE_KEYCODES[e.keyCode]);
            if (!this._isKeyDown[e.keyCode]){
                this._isNewKeyDown[e.keyCode] = true;
            }
        },
        keyUpCallback : function(e){
            //console.log('keyup:' + REVERSE_KEYCODES[e.keyCode]);
            delete this._isNewKeyDown[e.keyCode];
            this._isKeyDown[e.keyCode] = undefined;
        },
        isPressed : function(keyCode){
            return (this._isKeyDown[KEYCODES[keyCode]] === true);
        },
        tick : function(){
           var keys = Object.keys(this._isNewKeyDown);
           for (var i = keys.length - 1; i >= 0; i--) {
           		var keyCode = keys[i];
           		this._isKeyDown[keyCode] = true;
           		delete this._isNewKeyDown[keyCode];

                this.fireEvent('keydown:' + REVERSE_KEYCODES[keyCode])
           };
           for (var j = this._events.length - 1; j >= 0; j--) {
               this.fireEvent(this._events[j]);
           }
           this._events = [];
        },
        createProxy: function(){
            var proxy = new InputProxy(this);
            this._proxies.push(proxy);
            return proxy;
        },
        fireEvent: function(){
            var args = Array.prototype.slice.call(arguments);
            this._super.apply(this, args);
            var proxies = _.filter(this._proxies, function(p){return p.enable});
            for (var i = proxies.length - 1; i >= 0; i--) {
                proxies[i].fireEvent.apply(proxies[i], args);
            };
        },
	});

	return Input
})

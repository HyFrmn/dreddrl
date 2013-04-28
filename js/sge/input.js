define(
    ['sge/lib/class',
    'sge/observable',
    'sge/vendor/hammer'],
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
        }
    });

	var Input = Observable.extend({
		init: function(){
            this._super()
			this._isNewKeyDown = {}
            this._isKeyDown = {};
            this._proxies = [];
            this._events = [];
            this.joystick = new VirtualJoystick({
                container   : document.getElementById('game'),
                //mouseSupport  : true
            });
            document.onkeydown = this.keyDownCallback.bind(this);
            document.onkeyup = this.keyUpCallback.bind(this);
            Hammer(document).on('tap', this.tapCallback.bind(this));
        },
        tapCallback : function(e){
            console.log('tap');
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
        }
	});

	return Input
})

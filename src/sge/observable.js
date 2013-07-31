define([
    'sge/lib/class',
    ], function(Class){
    var Observable = Class.extend({
    	init: function () {
            this._listeners = {};
        },

        addListener: function (type, listener) {
            if (!this._listeners[type]) {
                this._listeners[type] = [];
            }
            this._listeners[type].push(listener);
            return listener;
        },

        fireEvent: function () {
        	var args = Array.prototype.slice.call(arguments);
        	event = args.shift();
            if (typeof(event) == "string") {
                event = {
                    type: event
                }
            }

            if (!event.target) {
                event.target = this;
            }

            if (!event.type) { //falsy
                throw new Error("Event object missing 'type' property.");
            }
            
            if (this._listeners[event.type]) {
                var listeners = this._listeners[event.type].slice(0);
                for (var i = 0, len = listeners.length; i < len; i++) {
                    try {
                        listeners[i].apply(this, args);
                    } catch(err) {
                        console.log("SandboxObservableError: " + err);
                        console.log(err.stack);
                        console.trace();
                    }
                }
            }
        },

        removeListener: function (type, listener) {
            if (this._listeners[type] instanceof Array) {
                var listeners = this._listeners[type];
                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i] === listener) {
                        var func = listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }
	})

    return Observable;
});

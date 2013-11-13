define(['sge/lib/class'], function(Class){
	var factory_map = {};

	var Component = Class.extend({
		init: function(entity, data){
			this.entity = entity;
			this.data = {};
			this._listeners = {};
			this._active = true;
		},
		get : function(path){
			var val = null
			if (path=='active'){
				return this._active;
			}
			if (this['_get_' + path] !== undefined){
				val = this['_get_' + path]();
			} else {
				val = this.data[path];
				if (val===undefined){
					if (this.__get_value!==undefined){
						val = this.__get_value(path);
					}
				}
			}
			return val;
		},
		set : function(path, value, method){
			if (path=='active'){
				return (this._active = Boolean(value));
			}
			var newValue = null;
			var args = Array.prototype.slice.call(arguments, 1);
			if (this['_set_' + path] !== undefined){
				newValue = this['_set_' + path].apply(this, args);
			} else {
				newValue = this.__set_value(path, value, method);
			}
			return newValue;
		},
		__set_value : function(path, value, method){
			switch (method){
				case 'add':
					var tmp = this.get(path);
					newValue = this.data[path] = tmp + value;
					break;
				case 'subtract':
					var tmp = this.get(path);
					newValue = this.data[path] = tmp - value;
					break;
				case 'set':
				default:
					newValue = this.data[path] = value;
					break;
			}
			return newValue;
		},
		register: function(state){
			this.state = state;
		},
		deregister: function(state){
			this.state = null;
		},
		createInputListener: function(event, callback){
			this._listeners[callback] = callback.bind(this);
		}
	});

	Component.register = function(name, klass){
		factory_map[name] = klass;
	};

	Component.Factory = function(name, entity, data){
		return new factory_map[name](entity, data);
	}

	return Component;
});

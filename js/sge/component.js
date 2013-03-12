define(['sge/lib/class'], function(Class){
	var factory_map = {};

	var Component = Class.extend({
		init: function(entity, data){
			this.entity = entity;
			this.data = {};
			this._listeners = {};
		},
		get : function(path){
			var val = null
			if (this['_get_' + path] !== undefined){
				val = this['_get_' + path]();
			} else {
				val = this.data[path];
			}
			return val;
		},
		set : function(path, value, method){
			var newValue = null;
					
			if (this['_set_' + path] !== undefined){
				newValue = this['_set_' + path](value, method);
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
		render : function(){},
		tick : function(){},
		register: function(state){

		},
		deregister: function(state){},
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
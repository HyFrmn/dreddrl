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
		set : function(path, value){
			this.data[path] = value;
			if (this['_set_' + path] !== undefined){
				this['_set_' + path](value);
			}
			return this.data[path];
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
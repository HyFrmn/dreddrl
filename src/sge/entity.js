define([
	'sge/lib/class',
    'sge/observable',
	'sge/component',
	'sge/components/sprite',
	'sge/components/anim',
	'sge/components/xform',
	'sge/components/movement',
	'sge/components/controls',
	'sge/components/physics',
	'sge/components/eventmgr'
	], function(Class, Observable, Component){



	var Entity = Observable.extend({
		init: function(componentData){
			this._super();
			this._tick_callbacks = [];
			this.id = null;
			this.components = {}
			this.tags = [];
			this.data = {};
			this.active = true;
			var keys = Object.keys(componentData);
			keys.reverse();
			for (var j = keys.length - 1; j >= 0; j--) {
				var key = keys[j];
				this.addComponent(key, componentData[key]);
			};
		},
		addComponent: function(name, data){
			var comp = Component.Factory(name, this, data);
			if (comp._alias){
				name = comp._alias;
			}
			this.components[name] = comp;
			return comp;
		},
		componentCall: function(){
			var args = Array.prototype.slice.call(arguments);
			var method = args.shift();
			var keys = Object.keys(this.components);
			for (var i = keys.length - 1; i >= 0; i--) {
				var comp = this.components[keys[i]];
				if (comp[method]!==undefined&&comp.get('active')){
					comp[method].apply(comp, args);
				}
			};
		},
		get : function(path){
			if (path=='active'){
				return this.active;
			}
			var subpaths = path.split('.');
			var compName = subpaths.shift();
			var comp = this.components[compName];
			if (subpaths.length){
				return comp.get(subpaths.join('.'));
			} else {
				return comp;
			}
		},
		set : function(path, value){
			if (path=='active'){
				return (this.active = Boolean(value));
			}
			var subpaths = path.split('.');
			var compName = subpaths.shift();
			var comp = this.components[compName];
			var args = Array.prototype.slice.call(arguments, 1);
			args.splice(0,0,subpaths.join('.'))
			return comp.set.apply(comp, args);
		},
		hasTag : function(tag){
			return (this.tags.indexOf(tag)>=0);
		},
		register : function(state){
			this.componentCall('register', state);
			this._hack();
		},
		deregister : function(state){
			this.componentCall('deregister', state)
		},
		_hack : function(){
			this._tick_callbacks = [];
			var keys = Object.keys(this.components);
			for (var i = keys.length - 1; i >= 0; i--) {
				var comp = this.components[keys[i]];
				if (comp.tick !== undefined){
					this._tick_callbacks.push(function(delta){
						if (this.active){
							this.tick(delta);
						}
					}.bind(comp));
				}
			}
		},
		tick : function(delta){
			this.componentCall('tick', delta);
		}
	});
	return Entity;
});

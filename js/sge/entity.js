define([
	'sge/lib/class',
    'sge/observable',
	'sge/component',
	'sge/components/sprite',
	'sge/components/anim',
	'sge/components/xform',
	'sge/components/movement',
	'sge/components/controls',
	'sge/components/debug',
	'sge/components/eventmgr'
	], function(Class, Observable, Component){



	var Entity = Observable.extend({
		init: function(componentData){
			this._super();
			this.id = null;
			this.components = {}
			this.tags = [];
			var keys = Object.keys(componentData);
			keys.reverse();
			for (var j = keys.length - 1; j >= 0; j--) {
				var key = keys[j];
				var comp = Component.Factory(key, this, componentData[key]);
				this.components[key] = comp;
			};
		},
		componentCall: function(){
			var args = Array.prototype.slice.call(arguments);
			var method = args.shift();
			var keys = Object.keys(this.components);
			for (var i = keys.length - 1; i >= 0; i--) {
				var comp = this.components[keys[i]];
				comp[method].apply(comp, args);
			};
		},
		get : function(path){
			var subpaths = path.split('.');
			var compName = subpaths.shift();
			var comp = this.components[compName];
			if (subpaths.length){
				return comp.get(subpaths.join('.'));
			} else {
				return comp;
			}
		},
		set : function(path, value, method){
			var subpaths = path.split('.');
			var compName = subpaths.shift();
			var comp = this.components[compName];
			return comp.set(subpaths.join('.'), value, method);
		},
		hasTag : function(tag){
			return (this.tags.indexOf(tag)>=0);
		},
		register : function(state){
			this.componentCall('register', state)
		},
		deregister : function(state){
			this.componentCall('deregister', state)
		}
	});
	return Entity;
});

define(['sge/component'], function(Component){
	var EventManagerComponent = Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			var keys = Object.keys(data.callbacks);
			for (var i = keys.length - 1; i >= 0; i--) {
				var key = keys[i];
				this.entity.addListener(key, data.callbacks[key]);
			};
		}
	});
	Component.register('eventmgr', EventManagerComponent);
    return EventManagerComponent;
})

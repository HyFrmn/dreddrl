define(['sge'], function(sge){
	var PhysicsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.width = data.width || 16;
			this.data.height = data.height || 16;
			this.data.type = data.type || 0;
		}
	})
	sge.Component.register('physics', PhysicsComponent);
    return PhysicsComponent;
})
define(['sge/component'], function(Component){
	var XFormComponent = Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.tx = data.tx || 0;
			this.data.ty = data.ty || 0;
			this.data.vx = data.vx || 0;
			this.data.vy = data.vy || 0;
			this.data.dir = data.dir || 'down';
		}
	});
	Component.register('xform', XFormComponent);
	return XFormComponent
});
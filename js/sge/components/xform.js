define(['sge/component'], function(Component){
	var XFormComponent = Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.tx = data.tx || 0;
			this.data.ty = data.ty || 0;
			this.data.vx = data.vx || 0;
			this.data.vy = data.vy || 0;
            this.data.container = data.container || 'scene'
			this.data.dir = data.dir || 'down';
			this.container = new CAAT.ActorContainer();
		},
		_get_container: function(){
			return this.container;
		},
		_set_tx : function(tx, method){
			this.data.tx = this.__set_value('tx', tx, method);
			this.entity.fireEvent('xform.move');
			return this.data.tx;
		},
		_set_ty : function(ty, method){
			this.data.ty = this.__set_value('ty', ty, method);
			this.entity.fireEvent('xform.move');
			return this.data.ty;
		},
		register: function(state){
            this._super(state);
            var containerName = this.data.container;
            //console.log('Name', containerName, this.state[containerName])
            this.scene = this.state[containerName];
            this.scene.addChild(this.container);
        },
        deregister: function(state){
            this.scene.removeChild(this.container);
            this._super(state);
        },
		render: function(renderer, layer){
			var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
			this.container.setLocation(tx, ty);
		}
	});
	Component.register('xform', XFormComponent);
	return XFormComponent
});

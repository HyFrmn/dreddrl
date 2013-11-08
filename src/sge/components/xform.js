define(['sge/component'], function(Component){
	var XFormComponent = Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.tx = data.tx || 0;
			this.data.ty = data.ty || 0;
			this.data.offsetX = data.offsetX || 0;
			this.data.offsetY = data.offsetY || 0;
			this.data.vx =0;
			if (data.vx !== undefined){
				this.data.vx = data.vx;
			}
			this.data.vy = 0;
			if (data.vy !== undefined){
				this.data.vy = data.vy;
			}
            this.data.container = data.container || 'scene'
			this.data.dir = data.dir || 'down';
			this.container = new CAAT.ActorContainer();
		},
		_get_container: function(){
			return this.container;
		},
		_set_t : function(tx, ty){
			this.data.tx = tx;
			this.data.ty = ty;
			this.entity.fireEvent('xform.move');
			return [tx, ty];
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
		_set_v : function(vx, vy){
			this.data.vx = vx;
			this.data.vy = vy;
			this.entity.fireEvent('xform.update');
			return [vx, vy];
		},
		_set_vx : function(vx, method){
			this.data.vx = this.__set_value('vx', vx, method);
			this.entity.fireEvent('xform.update');
			return this.data.vx;
		},
		_set_vy : function(vy, method){
			this.data.vy = this.__set_value('vy', vy, method);
			this.entity.fireEvent('xform.update');
			return this.data.vy;
		},
		register: function(state){
            this._super(state);
            var containerName = this.data.container;
            //console.log('Name', containerName, this.state[containerName])
            this.scene = this.state[containerName];
            this.scene.addChild(this.container);
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
			this.container.setLocation(tx + this.get('offsetX'), ty + this.get('offsetY'));
        },
        deregister: function(state){
            this.scene.removeChild(this.container);
            this._super(state);
        },
		render: function(renderer, layer){
			var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
			this.container.setLocation(tx + this.get('offsetX'), ty + this.get('offsetY'));
		}
	});
	Component.register('xform', XFormComponent);
	return XFormComponent
});

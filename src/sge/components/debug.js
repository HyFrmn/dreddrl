define(['sge/component'], function(Component){
	var DebugComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this.data.fillStyle = 'yellow';
            this.data.strokeStyle = 'black';
            this.entity.addListener('contact.start', function(){
            	this.data.fillStyle = 'red';
            }.bind(this))
            this.entity.addListener('contact.end', function(){
            	this.data.fillStyle = 'yellow';
            }.bind(this))
        },
		render : function(renderer, layer){
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var width = this.entity.get('physics.width');
            var height = this.entity.get('physics.height');
            //renderer.drawRect(layer, tx - width/2, ty - height/2, width, height, {fillStyle: this.get('fillStyle'), strokeStyle: this.get('strokeStyle')})
        }
	})
	Component.register('debug', DebugComponent);

    return DebugComponent;
});

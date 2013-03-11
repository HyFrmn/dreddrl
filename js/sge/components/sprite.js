define(['sge/component', 'sge/spritesheet', '../config'], function(Component, SpriteSheet, config){
	var SpriteComponent = Component.extend({
		init : function(entity, data){
			this._super(entity, data)
			this.data.frame = 0;
			this.data.scale = data.scale || 1;
			this.data.mirror = true;
			this.data.offsetX = data.offsetX || 0;
			this.data.offsetY = data.offsetY || 0;
			this.spriteSheet = new SpriteSheet(config.baseUrl + data.src, data.width, data.height);

			this.tintCallback = function(color, length){
				this.spriteSheet.tint(color);
				var timer = this.entity.state.createTimeout(length, function(){
					this.spriteSheet.tint();
				}.bind(this));
			}.bind(this);
			this.entity.addListener('tint', this.tintCallback);
		},
		render : function(renderer, layer){

			if (this.data.scale===undefined){
				this.data.scale=1;
			}
			var mirrorScale = 1;
			if (this.data.mirror){
				mirrorScale = -1;
			}
			var x = this.entity.get('xform.tx');
			var y = this.entity.get('xform.ty');
			var scale = [1,1];
			if (this.data.mirror){
				scale = [-1,1];
			}
			renderer.drawSprite(layer, this.spriteSheet, this.data.frame, x + this.data.offsetX, y + this.data.offsetY, scale);
		}
			
	});
	Component.register('sprite', SpriteComponent);
	return SpriteComponent;
});
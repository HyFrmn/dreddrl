define(['sge/component', 'sge/spritesheet', 'sge/config'], function(Component, SpriteSheet, config){
	var SpriteComponent = Component.extend({
		init : function(entity, data){
			this._super(entity, data)
			this.data.frame = data.frame || 0;
			this.data.scale = data.scale || 1;
			this.data.mirror = true;
			this.data.offsetX = data.offsetX || 0;
			this.data.offsetY = data.offsetY || 0;
			var img = new Image();
			img.src = config.baseUrl + data.src;
			this.spriteSheet = new CAAT.SpriteImage().initialize(img,4,3)
            //new SpriteSheet(config.baseUrl + data.src, data.width, data.height);
            /*
			this.tintCallback = function(color, length){
				this.spriteSheet.tint(color);
				var timer = this.entity.state.createTimeout(length, function(){
					this.spriteSheet.tint();
				}.bind(this));
			}.bind(this);
			this.entity.addListener('tint', this.tintCallback);
			*/
		},
		register: function(state){
			this._super(state);
			var scene = this.state.scene;
			var x = this.entity.get('xform.tx');
			var y = this.entity.get('xform.ty');
			this.actor = new CAAT.Actor().
			        setLocation(x,y).
			        setBackgroundImage(this.spriteSheet).
                    setAnimationImageIndex( [0,1,2,1] )
			scene.addChild(this.actor);
			this.scene = scene;
			//console.log(this.actor);
		},
		deregister: function(state){
			this.scene.removeChild(this.actor);
			this._super(state);
		},
		
		render : function(renderer, layer){
			var x = this.entity.get('xform.tx');
			var y = this.entity.get('xform.ty');
			this.actor.setLocation(x, y);
		}
			
	});
	Component.register('sprite', SpriteComponent);
	return SpriteComponent;
});
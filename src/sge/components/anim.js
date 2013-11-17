define(['sge/component'], function(Component){
	var AnimComponent = Component.extend({
		init : function(entity, data){
			this._super(entity, data);
			this._lastUpdate = 0;
			this.data.play = false;
			this.data.fps = data.fps || 15;
			this.loop=false;
			this.frame = 0;
			var keys = Object.keys(data.frames);
			this.animData = {};
			for (var i = keys.length - 1; i >= 0; i--) {
				var key = keys[i];
				var val = data.frames[key];
				if (val.frames===undefined){
					val = { frames: val }
				}
				this.animData[key] = val;
			};
			this.current = null;
			this.currentAnim = null;
			this.frameLength = null;
			this.setAnim(this.data.anim || key);
		},
		tick : function(delta){
			if (this.data.play){
				this._lastUpdate = this._lastUpdate - delta;
				if (this._lastUpdate <= 0){
					this._lastUpdate = (1/this.data.fps);
					this.frame++;
					if (this.frame>=this.frameLength){
						if (this.loop){
							this.frame=0;
						} else {
							this.frame=this.frameLength-1;
							this.data.play = false;
							this.entity.fireEvent('anim.complete');
						}
					}
					this.entity.set('sprite.frame', this.currentAnim[this.frame]);
				}
			}
		},
		_set_anim : function(value) {
			if (value != this.current){
				this.setAnim(value);
			}
		},
		hasAnim: function(name){
			return (this.animData[name]!=undefined)
		},
		setAnim : function(name){
			this.current = name;
			var data = this.animData[name];
			var mirrored = (data.mirror === true);
			this.entity.set('sprite.mirror', mirrored);
			this.loop = data.loop == undefined ? true : data.loop;
			this.currentAnim = this.animData[name].frames;
			this.frameLength = this.currentAnim.length;
			this.data.anim = name;
			this.frame = 0;
		}
	});
	Component.register('anim', AnimComponent);
	return AnimComponent
});

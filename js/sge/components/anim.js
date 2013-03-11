define(['sge/component'], function(Component){
	var AnimComponent = Component.extend({
		init : function(entity, data){
			this._super(entity, data);
			this.data.play = false;
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
			this.setAnim("walk_right");
		},
		tick : function(){
			if (this.data.play){
				this.frame++;
				if (this.frame>=this.frameLength){
					this.frame=0;
				}
				this.entity.set('sprite.frame', this.currentAnim[this.frame]);
			}
		},
		_set_anim : function(value) {
			if (value != this.current){
				this.setAnim(value);
			}
		},
		setAnim : function(name){
			this.current = name;
			var mirrored = (this.animData[name].mirror === true);
			this.entity.set('sprite.mirror', mirrored);
			this.currentAnim = this.animData[name].frames;
			this.frameLength = this.currentAnim.length;
			this.data.anim = name;
		}
	});
	Component.register('anim', AnimComponent);
	return AnimComponent
});
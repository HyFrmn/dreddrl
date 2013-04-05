define(['sge'], function(sge){
	var Emote = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this._visible = false;
			this.data.text = data.text || "";
			this.entity.addListener('emote.msg', function(msg){
				this.set('text', msg);
				this._visible = true;
				this.entity.state.createTimeout(1, function(){
					this._visible = false;
				}.bind(this));
			}.bind(this))
		},
		render: function(renderer, layer){
			if (this._visible){
				var tx = this.entity.get('xform.tx');
	            var ty = this.entity.get('xform.ty');
				renderer.drawRect(layer, tx+12,ty-48,64,16, {fillStyle: 'black'}, 150);
				renderer.drawText(layer, tx+16,ty-36, this.get('text'), {fillStyle: 'white', fontSize: '16px', baseline:'top'}, 180);
			}
		}
	});

	sge.Component.register('emote', Emote);

	return Emote;
});
define(['sge'], function(sge){
	var Emote = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this._visible = false;
            this.fontSize = 16;
			this.data.text = data.text || "";
            this.data.length = data.length || 2;
			this.entity.addListener('emote.msg', function(msg, length){
                if (this.container!=undefined){
                    length = length || this.get('length')
    				this.container.setVisible(true);
    				this.set('text', msg);
    				this.entity.state.createTimeout(length, function(){
    					this.container.setVisible(false);
    				}.bind(this));
                }
			}.bind(this))
		},
		register: function(state){
            this._super(state);
            this.scene = this.state.scene;
            this.container = new CAAT.ActorContainer().setLocation(32,-24);
            this.bg = new CAAT.Actor().setSize(32,16).setFillStyle('black');
            this.container.addChild(this.bg);
            this.text = new CAAT.TextActor().setLocation(2,2).setFont(this.fontSize + 'px sans-serif');
            this.container.addChild(this.text);
            this.container.setVisible(false);
            this.entity.get('xform').container.addChild(this.container);
        },
        deregister: function(state){
            this.entity.get('xform').container.removeChild(this.container);
            this._super(state);
        },
        _set_text: function(text){
            this.data.text = text;
        	this.text.setText(text);
        	this.text.calcTextSize(this.state.game.renderer);
        	this.bg.setSize(this.text.textWidth+4, this.fontSize + 8);
        	return text;
        }
	});

	sge.Component.register('emote', Emote);

	return Emote;
});

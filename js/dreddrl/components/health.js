define(['sge/component'], function(Component){
	var HealthComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this.data.visible = data.visible === undefined ? true : data.visible;
            this.data.life = data.life || 100;
            this.data.maxLife = data.maxLife || data.life || 100;
            this.data.alignment = data.alignment || 0;
            this.entity.addListener('contact.start', function(entity){
                if (!entity.get('health')){
                    return;
                }
                var alignA = this.get('alignment');
                var alignB = entity.get('health.alignment');
                if ((alignA==0)||(alignB==0)){
                    return;
                }
                if ((alignA<0)&&(alignB<0)){
                    return
                }
                if ((alignA>0)&&(alignB>0)){
                    return
                }
            	this.set('life', -1, 'add');
                if (this.data.life <= 0){
                    this.data.life = 0;
                    this.entity.fireEvent('kill', 'Ran out of health.');
                } else {
                    this.entity.fireEvent('tint', 'red', 0.25);
                }
            }.bind(this));
        },
        register: function(state){
            this._super(state);
            this.scene = this.state.scene;
            this.container = new CAAT.ActorContainer().setLocation(0,-24);;
            bg = new CAAT.Actor().setSize(32,6).setFillStyle('black');
            this.container.addChild(bg);
            this.lifebar = new CAAT.Actor().setSize(30,4).setFillStyle('green').setLocation(1,1);
            this.container.addChild(this.lifebar);
            this.container.setVisible(this.get('alignment')!=0 && this.get('visible')!=false)
            this.entity.get('xform.container').addChild(this.container);
        },
        deregister: function(state){
            this.entity.get('xform.container').removeChild(this.container);
            this._super(state);
        },
        _set_life : function(value, method){
            var life = this.__set_value('life', value, method);
            this.data.life = Math.min(life, this.get('maxLife'));
            var pct = this.data.life/this.get('maxLife');
            this.set('pct', pct);
            fillColor = 'green';
            if (pct<=0.75){
                fillColor = 'yellow';
            } else if (pct<=0.5) {
                fillColor = 'orange';
            } else if (pct<=0.25) {
                fillColor = 'red';
            }
            this.lifebar.setFillStyle(fillColor);
            this.lifebar.setSize(30*(pct),4)
            return this.data.life
        }
	})
	Component.register('health', HealthComponent);

    return HealthComponent;
});
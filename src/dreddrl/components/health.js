define(['sge'], function(sge){
	var HealthComponent = sge.Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this.data.visible = data.visible === undefined ? true : data.visible;
            this.data.life = data.life || 100;
            this.data.maxLife = data.maxLife || data.life || 100;
            this.data.alignment = data.alignment || 0;

            this._stuned = false;

            this.entity.addListener('entity.takeDamage', function(damageProfile){
                if (damageProfile.damageType=='STUN'){
                    if (!this._stuned){
                        this._stuned = true;
                        this.entity.fireEvent('sprite.tint','cyan');
                        this.entity.get('enemyai').active = false;
                        this.entity.set('xform.v', 0, 0);

                        this._stunTimeout = this.state.createTimeout(damageProfile.damage, function(){
                            this._stuned=false;
                            this.entity.fireEvent('sprite.tint');
                            this.entity.get('enemyai').active = true;
                        }.bind(this));
                    } else {
                        this._stunTimeout._length += damageProfile.damage/2;
                    }
                } else {
                    this.set('life', -damageProfile.damage, 'add');
                    if (this.data.life <= 0){
                        this.data.life = 0;
                        this.entity.fireEvent('entity.kill', damageProfile.entity);
                    } else {
                        this.entity.fireEvent('sprite.tint', 'red', 0.25);
                    }
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
            var pct = this.get('pct');
            if (this.container){
                
                if (this.get('alignment')==0){
                    if (pct==1){
                        this.container.setVisible(false)
                    } else {
                        this.container.setVisible(true);
                    }
                }
                fillColor = 'green';
                if (pct<=0.75){
                    fillColor = 'yellow';
                } else if (pct<=0.5) {
                    fillColor = 'orange';
                } else if (pct<=0.25) {
                    fillColor = 'red';
                }
                this.container.stopCacheAsBitmap()
                this.lifebar.setFillStyle(fillColor);
                this.lifebar.setSize(30*(pct),4);
                this.container.stopCacheAsBitmap();
            }
            return this.data.life
        },
        _get_pct : function(value, method){
            return (this.get('life') / this.get('maxLife'));
        }
	})
	sge.Component.register('health', HealthComponent);

    return HealthComponent;
});

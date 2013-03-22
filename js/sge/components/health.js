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
            	this.data.life--;
                if (this.data.life <= 0){
                    this.data.life = 0;
                    this.entity.fireEvent('kill', 'Ran out of health.');
                } else {
                    this.entity.fireEvent('tint', 'red', 0.25);
                }
            }.bind(this));
        },
        _set_life : function(value, method){
            var life = this.__set_value('life', value, method);
            this.data.life = Math.min(life, this.get('maxLife'));
            return this.data.life
        },
        render : function(renderer, layer){
            if (!this.get('visible')){
                return;
            }
            var life = this.data.life / this.data.maxLife;
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            renderer.drawRect(layer, tx - 16, ty - 48, 32, 4, {fillStyle: 'black', strokeStyle: 'black'}, 10);
            renderer.drawRect(layer, tx - 16, ty - 48, 32 * life, 4, {fillStyle: 'green', strokeStyle: 'none'}, 100);
        }
	})
	Component.register('health', HealthComponent);

    return HealthComponent;
});
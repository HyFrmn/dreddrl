define(['sge'], function(sge){
    var ContainerComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.on = data.on==undefined ? false : data.on;
            this.data.fullFrame = data.fullFrame;
            this.data.emptyFrame = data.emptyFrame;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact.bind(this));
        },
        update: function(){
            if (this.entity.get('inventory.items').length>0){
                this.entity.set('sprite.frame', this.data.fullFrame);
            } else {
                this.entity.set('sprite.frame', this.data.emptyFrame);
            }
        },
        interact: function(entity){
            var items = this.entity.get('inventory.items');
            if (items){
                for (var i = items.length - 1; i >= 0; i--) {
                    var item = items[i];
                    entity.fireEvent('pickup', item)
                }
            }
            this.entity.set('inventory.items', []);
            this.update();
        },
        register: function(state){
            this._super(state);
            this.update();
        }
    });
    sge.Component.register('container', ContainerComponent);
    return ContainerComponent
})

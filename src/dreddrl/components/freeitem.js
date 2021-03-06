define(['sge'], function(sge){
    var FreeItem = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.name = data.name || "Item";
            var keys = Object.keys(data);
            for (var i = keys.length - 1; i >= 0; i--) {
                this.data[keys[i]] = data[keys[i]];
            };
            if (this.data.item.encounter){
                entity.addComponent('encounter', {
                    encounter: this.data.item.encounter
                });
                console.log('Add Encounter Component');
            }
            this.pickup = this.pickup.bind(this);
            this.entity.addListener('contact.start', this.pickup);
        },
        pickup: function(entity){
            if (entity.hasTag('pc')){
                entity.fireEvent('pickup', this.get('item'));
                this.entity.fireEvent('entity.kill');
            }
        },
    	register: function(state){
			this.state = state;
		},
		unregister: function(){
			this.state = null;
		}
    });
    sge.Component.register('freeitem', FreeItem);
    return FreeItem
})

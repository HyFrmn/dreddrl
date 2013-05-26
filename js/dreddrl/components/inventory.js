define(['sge', '../action'],function(sge, Action){

	var InventoryComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.ammo = data.ammo || 100;
			this.data.keys = data.keys || 3;
			this.data.items = []
			this.data.objects = {};
			this.entity.addListener('pickup', this.pickup.bind(this));
		},
		pickup: function(entity){
			var freeitem = entity.get('freeitem');
			var item = freeitem.get('item');

			this.entity.fireEvent('log', 'Picked up ' + item.name);
			if (item.immediate){
				if (item.effect){
					action = Action.Factory(this.entity, item.effect);
					action.run();
				}
			} else {
				this.data.items.push(item.id);
			}

		},
		subtractProperty: function(prop, value){
			value = value || 1;
			value = this.get(prop) - value;
			this.set(prop, value);
		}
	})
	sge.Component.register('inventory', InventoryComponent);
    return InventoryComponent;
})		

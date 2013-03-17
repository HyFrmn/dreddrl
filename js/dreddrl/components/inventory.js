define(['sge','jquery'],function(sge, $){

	var InventoryComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.ammo = data.ammo || 20;
			this.data.items = []
			this.data.objects = {};
			this._elem_ammo = $('span.ammo');
			this.entity.addListener('pickup', this.pickup.bind(this));
		},
		pickup: function(entity){
			var freeitem = entity.get('freeitem');
			var newAmmo = freeitem.get('inventory.ammo');
			var keys = Object.keys(freeitem.data);
			for (var i = keys.length - 1; i >= 0; i--) {
				var key = keys[i];
				if (key=='inventory.add'){
					this.data.items.push(freeitem.data[key]);
				} else {
					console.log(key, freeitem.data[key])
					this.entity.set(key, freeitem.data[key], 'add');
				}
			};
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
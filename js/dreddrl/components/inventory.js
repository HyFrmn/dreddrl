define(['sge','jquery'],function(sge, $){

	var InventoryComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.ammo = data.ammo || 20;
			this.data.objects = {};
			this._elem_ammo = $('span.ammo');
			this.entity.addListener('pickup', this.pickup.bind(this));
		},
		pickup: function(entity){
			var freeitem = entity.get('freeitem');
			var newAmmo = freeitem.get('inventory.ammo');
			if (newAmmo){
				console.log('Ammo:', this.set('ammo',newAmmo,'add'));
			}
			var newLife = freeitem.get('health.life');
			if (newLife){
				console.log('Life:', this.entity.set('health.life',newLife,'add'));
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
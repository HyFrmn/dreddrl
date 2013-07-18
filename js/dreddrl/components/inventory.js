define(['sge', '../expr', '../item','../action'],function(sge, Expr, Item, Action){

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

			this.entity.fireEvent('state.log', 'Picked up ' + item.name);
			if (item.actions.pickup){
					var expr = new Expr(item.actions.pickup);
					expr.loadContext(item.getContext());
					console.log('Expr:',expr);
					expr.run();
				
			} else {
				this.addItem(item);
			}

		},
		subtractProperty: function(prop, value){
			value = value || 1;
			value = this.get(prop) - value;
			this.set(prop, value);
		},
		hasItem : function(item){
			
		},
		addItem : function(item){
			this.data.items.push(item.id);
		},
		removeItem : function(item){
			this.data.items = this.dat
		}
	})
	sge.Component.register('inventory', InventoryComponent);
    return InventoryComponent;
})		

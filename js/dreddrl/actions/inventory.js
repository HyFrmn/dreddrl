define(['sge','../action'], function(sge, Action){
    var InventoryAddAction = Action.extend({
		start: function(entityId, item){
            var entity = this.getEntity(entityId);
            var inventory = entity.get('inventory');

            inventory.addItem(item);
		}
	});
	Action.register('inventory.add', InventoryAddAction);

    var InventoryRemoveAction = Action.extend({
        start: function(entityId, item){
            var entity = this.getEntity(entityId);
            var inventory = entity.get('inventory');

            inventory.removeItem(item);
        }
    });
    Action.register('inventory.remove', InventoryRemoveAction);

	return {}
})

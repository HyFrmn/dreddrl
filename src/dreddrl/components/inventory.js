define(['sge', '../expr', '../item','../action'],function(sge, Expr, Item, Action){

	var InventoryComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.ammo = data.ammo || 100;
			this.data.keys = data.keys || 3;
            this.data.cash = data.cash || 3;
			this.data.items = [];
            if (data.items){
                data.items.forEach(function(itemType){
                    item = Item.Factory(itemType);
                    this.addItem(item);
                }.bind(this))
            }
			this.data.objects = {};
			this.entity.addListener('entity.kill', this.dropAllItems.bind(this));
            this.entity.addListener('pickup', this.pickup.bind(this));
			this.entity.addListener('inventory.add', this.addItem.bind(this));
		},
        pickupCallback: function(){
            var freeitem = entity.get('freeitem');
            var item = freeitem.get('item');

            this.pickup(item);
        },
		pickup: function(item){
			this.entity.fireEvent('state.log', 'Picked up ' + item.name);
            console.log('Item:', item)
			if (item.instant){
                if (item.actions.use){
    				var expr = new Expr(item.actions.use);
                    expr.addContext('self', this.entity);
    				expr.loadContext(item.getContext());
    				expr.run();
    			}
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
			this.data.items.push(item);
		},
		removeItem : function(item){
            var index = this.data.items.indexOf(item);
			if (index>=0){
                this.data.items.splice(index,1);
            }
		},
        dropAllItems : function(){
            var cb = this.dropItem.bind(this);
            this.data.items.forEach(cb);
        },
		dropItem: function(item){
            var dropDir = null;
            var tileX = Math.floor(this.entity.get('xform.tx')/32)
            var tileY = Math.floor(this.entity.get('xform.ty')/32)
            var i=5;
            while (i--){
                var theta = Math.random() * 2 * Math.PI;
                var dir = [Math.sin(theta),Math.cos(theta)];
                dropX = this.entity.get('xform.tx')+(32*dir[0]);
                dropY = this.entity.get('xform.ty')+(32*dir[1]);
                var tile = this.state.map.getTile(Math.floor(dropX/32), Math.floor(dropY/32));
                if (tile.passable){
                    dropDir = [dropX, dropY];
                    break;
                }
            }
            if (dropDir===null){
                return;
            }
            this._createDropItem(item, dropDir[0], dropDir[1]);
        },
        _createDropItem: function(item, tx, ty){
            var def = {
                xform: {
                    tx: tx,
                    ty: ty,
                },
                freeitem : {
                    item : item
                },
                sprite : {
                    frame : item.spriteFrame,
                    src: 'assets/sprites/' + item.spriteImage
                }
            };
            if (item.encounter){
                def.encounter = {encounter: item.encounter}
            }
            if (this.data.pickup){
                def.actions = {
                    pickup: this.data.pickup
                }
            }
            var newItem = this.state.factory('freeitem', def);
            this.state.addEntity(newItem);
            return newItem;
        }
	})
	sge.Component.register('inventory', InventoryComponent);
    return InventoryComponent;
})		

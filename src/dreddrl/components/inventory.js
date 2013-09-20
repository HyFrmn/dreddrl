define(['sge', '../expr', '../item','../action'],function(sge, Expr, Item, Action){

	var InventoryComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.ammo = data.ammo || 100;
			this.data.keys = data.keys || 3;
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
		pickup: function(entity){
			var freeitem = entity.get('freeitem');
			var item = freeitem.get('item');

			this.entity.fireEvent('state.log', 'Picked up ' + item.name);
			if (item.actions.pickup){
					var expr = new Expr(item.actions.pickup);
                    expr.addContext('self', this.entity);
					expr.loadContext(item.getContext());
					console.log('Expr:',expr);
					expr.run();
				
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
            var allDirs = sge.random.shuffle([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]]);
            while (allDirs.length){
                var dir = allDirs.shift()
                var tile = this.state.map.getTile(tileX + dir[0], tileY + dir[1]);
                if (tile.passable){
                    dropDir = [32 * (tileX + dir[0] + 0.5), 32 * (tileY + dir[1] + 0.5)];
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

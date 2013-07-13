define(['sge', '../item'], function(sge, Item){
    var DeadDrop = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.items = data.items || [];
            this.data.count = data.count || 1;
            this.data.always = data.always || [];
            this.data.pickup = data.pickup;
            this.drop = this.drop.bind(this);
            this.entity.addListener('entity.kill', this.drop);
        },
        drop: function(){
            var dropDir = null;
            var tileX = Math.floor(this.entity.get('xform.tx')/32)
            var tileY = Math.floor(this.entity.get('xform.ty')/32)
            var allDirs = [[1,0],[-1,0],[0,1],[0,-1]];
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
            for (var i=0;i<this.get('count');i++){
                var item = sge.random.item(this.get('items'));
                if (typeof item == 'string'){
                    if (item.match(/^@/)){
                        name = item.replace('@(','').replace(')','');
                        item = this.entity.get(name);
                    } else {
                        item = Item.Factory(item);
                    }
                }
                this.dropItem(item, dropDir[0], dropDir[1])
            }
            _.each(this.get('always'), function(i){
                this.dropItem(i, tx, ty);
            }.bind(this));
        },
        dropItem: function(item, tx, ty){
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
    });
    sge.Component.register('deaddrop', DeadDrop);
    return DeadDrop
})

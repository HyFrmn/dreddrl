define(['sge'], function(sge){
    var DeadDrop = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.items = data.items || ['rammen','gun'];
            this.data.count = data.count || 1;
            this.data.always = data.always || [];
            this.drop = this.drop.bind(this);
            this.entity.addListener('kill', this.drop);
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
                this.dropItem(sge.random.item(this.get('items')), dropDir[0], dropDir[1])
            }
            _.each(this.get('always'), function(i){
                this.dropItem(i, tx, ty);
            }.bind(this));
        },
        dropItem: function(item, tx, ty){
            var newItem = this.state.factory(item, {
                xform: {
                    tx: tx,
                    ty: ty,
                }});

            this.state.addEntity(newItem);
            return newItem;
        }
    });
    sge.Component.register('deaddrop', DeadDrop);
    return DeadDrop
})

define(['sge'], function(sge){
    var DeadDrop = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
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
            var newItem = this.state.factory((Math.random() > 0.5 ? 'rammen' : 'gun'), {
                xform: {
    				tx: dropDir[0],
					ty: dropDir[1],
				}});

            this.state.addEntity(newItem);
            console.log(newItem);
        },
    	register: function(state){
			this.state = state;
		},
		unregister: function(){
			this.state = null;
		}
    });
    sge.Component.register('deaddrop', DeadDrop);
    return DeadDrop
})
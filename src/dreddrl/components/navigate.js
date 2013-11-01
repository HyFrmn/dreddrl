define(['sge'], function(sge){
	var Navigate = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
            this.data.threshold = data.threshold || 32;
            this.pathPoints = [];
			this.entity.addListener('navigate.entity', this.navToEntity.bind(this));
		},
        navToEntity: function(entity, callback){
            var dx = entity.get('xform.tx');
            var dy = entity.get('xform.ty');
            return this.navToPos(dx,dy, callback);
        },
        navToPos: function(destX ,destY, callback){
            this._callback = callback;
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var tileX = Math.floor(tx/32);
            var tileY = Math.floor(ty/32);
            var endTileX = Math.floor(destX/32);
            var endTileY = Math.floor(destY/32);
            this.pathPoints = this.state.map.getPath(tileX, tileY,endTileX,endTileY);
        },
        stopNavigation: function(){
            this.entity.set('xform.v', 0, 0);
            if (this._callback){
                this._callback();
                this._callback = undefined;
            }
        },
        tick: function(delta){
            if (this.pathPoints.length<=0){
                return;
            }
            var speed = 64;
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var goalX = this.pathPoints[0][0];
            var goalY = this.pathPoints[0][1];
            var dx = goalX - tx;
            var dy = goalY - ty;
            var dist = Math.sqrt((dx*dx)+(dy*dy));
            if (dist<this.get('threshold')){
                this.pathPoints.shift();
                if (this.pathPoints.length<=0){
                    this.stopNavigation();
                    return;
                }
            }
            this.entity.set('xform.v', dx / dist * speed, dy / dist * speed);
        }
	});

	sge.Component.register('navigate', Navigate);

	return Navigate;
});

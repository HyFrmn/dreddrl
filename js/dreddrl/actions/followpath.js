define(['sge','../action'], function(sge, Action){
	var FollowPathAction = Action.extend({
		start: function(destX ,destY){
	        this.async = true;
	        var tx = this.entity.get('xform.tx');
	        var ty = this.entity.get('xform.ty');
	        var tileX = Math.floor(tx/32);
	        var tileY = Math.floor(ty/32);
	        var endTileX = Math.floor(this.parseExpr(destX)/32);
	        var endTileY = Math.floor(this.parseExpr(destY)/32);
	        this.pathPoints = this.state.map.getPath(tileX, tileY,endTileX,endTileY);
		},
		tick: function(delta){
			console.log(this.pathPoints.length)
			if (this.pathPoints.length<=0){
				this.entity.set('xform.v', 0, 0);
        		this.end();
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
	        if (dist<6){
	        	this.pathPoints.shift();
	        }
	        this.entity.set('xform.v', dx / dist * speed, dy / dist * speed);
		}
	});
	Action.register('followpath', FollowPathAction);
	return FollowPathAction
})

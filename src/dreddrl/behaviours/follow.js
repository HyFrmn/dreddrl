define(['sge', '../behaviour', '../actions/followpath'], function(sge, Behaviour){
	var FollowBehaviour = Behaviour.Add('follow', {
        onStart: function(target, options){
            options = options || {};
            this.target = target;
            this.dist = options.dist || 64;
            
            this._matchSpeed = null;
            

            options.speed = 'match';
            if (options.speed == 'match'){
                this._matchSpeed = this.entity.get('movement.speed');
                this.entity.set('movement.speed', 
                    target.get('movement.speed'))
            }
        },

        tick: function(delta){
            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;

            var dist = Math.sqrt(deltax * deltax + deltay * deltay);
            var nx = 0;
            var ny = 0;
            
           if (dist>this.dist){
                nx = deltax / dist;
                ny = deltay / dist;
            }
            this.entity.set('movement.v', nx,ny); 
            
        }
    })
	return FollowBehaviour;
});
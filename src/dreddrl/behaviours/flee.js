define(['sge', '../behaviour'], function(sge, Behaviour){
    var FleeBehaviour = Behaviour.Add('flee', {
        onStart: function(target){
            this.target = target;
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
            console.log('Tick')
            if (dist<96){
                nx = -deltax / dist;
                ny = -deltay / dist;
            }
            this.entity.set('movement.v', nx,ny);
        }
    })
    return FleeBehaviour
});
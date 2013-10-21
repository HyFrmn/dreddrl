define(['sge', '../behaviour'], function(sge, Behaviour){

    var IdleBehaviour = Behaviour.Add('idle', {
        onStart: function(){
            this.entity.set('movement.v',0,0);
            this._timeout=0;       
        },
        tick: function(){
            var region = this.entity.get('ai.region');
            if (this._timeout<=0){
                this._timeout = 30 + (Math.random()*30);
                var vx = 0;
                var vy = 0;
                if (Math.random()>0.5){    
                    vx = ((Math.random() * 2) - 1);
                    vy = ((Math.random() * 2) - 1);
                    if (region){
                        var tx = this.entity.get('xform.tx');
                        var ty = this.entity.get('xform.ty');
                        if (region.test(tx,ty)){ 
                            while (!region.test(tx+vx*32,ty+vy*32)){
                                vx = ((Math.random() * 2) - 1);
                                vy = ((Math.random() * 2) - 1);
                            }
                        }
                    }
                }
                this.entity.set('movement.v', vx, vy);
            } else {
                this._timeout--;
                if (false){
                    var tx = this.entity.get('xform.tx');
                    var ty = this.entity.get('xform.ty');
                    if (!region.test(tx,ty)){
                        var rx = region.get('xform.tx');
                        var ry = region.get('xform.ty');
                        var dx = tx - rx;
                        var dy = ty - ry;
                        var dist = Math.sqrt(dx*dx+dy*dy);

                        this.entity.set('movement.v', -dx/dist, -dy/dist)
                    }
                }
            }
        }
    });
    
    return IdleBehaviour;
});
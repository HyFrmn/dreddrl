define(['sge', '../actions/followpath'], function(sge, FollowPathAction){

    var Behaviour = sge.Class.extend({
        init: function(entity){
            this.entity = entity;
        },
        tick: function(delta){},
        onStart: function(){},
        onEnd: function(){}
    });
    Behaviour._classMap = {};
    Behaviour.Add = function(type, data){
        klass = Behaviour.extend(data);
        Behaviour._classMap[type] = klass;
        return klass;
    }
    Behaviour.Create = function(type, entity){
        return new Behaviour._classMap[type](entity);
    }

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
                if (region){
                    var tx = this.entity.get('xform.tx');
                    var ty = this.entity.get('xform.ty');
                    if (!region.test(tx,ty)){
                        var rx = region.get('xform.tx');
                        var ry = region.get('xform.ty');
                        var dx = tx - rx;
                        var dy = ty - ry;
                        var dist = Math.sqrt(dx*dx+dy*dy);

                        this.entity.set('movement.v', -dx/dist,-dy/dist)
                    }
                }
            }
        }
    });

    var FollowBehaviour = Behaviour.Add('follow', {
        onStart: function(target, options){
            options = options || {};
            this.target = target;
            this.dist = options.dist || 64;
            this._matchSpeed = null;
            options.speed = 'match';
            if (options.speed == 'match'){
                this._matchSpeed = this.entity.get('movement.speed');
                this.entity.set('movement.speed', target.get('movement.speed'))
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

    var AIComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.behaviour = null;
            this.data.region = data.region || null;
            this.set('behaviour', 'idle');
        },
        _set_behaviour : function(value, arg0, arg1, arg2){
            var behaviour = Behaviour.Create(value, this.entity);
            if (this.behaviour){
                this.behaviour.onEnd();
            }
            this.behaviour = behaviour;
            //console.log(arg0, arg1, arg2)
            this.behaviour.onStart(arg0, arg1, arg2);
        },
        tick: function(delta){
            if (this.behaviour){
                this.behaviour.tick(delta);
            }
        }
    });
    sge.Component.register('ai', AIComponent);

    return AIComponent;
})
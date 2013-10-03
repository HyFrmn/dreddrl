define(['sge/component'], function(Component){
    var MovementComponent = Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.speed = 80;
            this.data.vx=0;
            this.data.vy=0;
            this.data.strafe=false;
            this.data.width = data.width || 640;
            this.data.height = data.height || 480;
            this.data.map = data.map || null;
            this._isKeyDown = {};
        },
        _set_v : function(vx, vy){
            this.data.vx = vx;
            this.data.vy = vy;
            return [vx, vy];
        },
        tick: function(delta){
            var vx = this.get('vx') * this.get('speed');
            var vy = this.get('vy') * this.get('speed');
            this.entity.set('xform.vx', vx);
            this.entity.set('xform.vy', vy);
            if ((Math.abs(vx) > 0) || (Math.abs(vy) > 0)){
                if (!this.get('strafe')){
                    this.entity.set('anim.play', true)
                    if (Math.abs(vx) > Math.abs(vy)){
                        if (vx > 0){
                            this.entity.set('anim.anim', 'walk_right');
                            this.entity.set('xform.dir', 'right');
                        } else {
                            this.entity.set('anim.anim', 'walk_left');
                            this.entity.set('xform.dir', 'left');
                        }
                    } else {
                        if (vy < 0){
                            this.entity.set('anim.anim', 'walk_up');
                            this.entity.set('xform.dir', 'up');
                        } else {
                            this.entity.set('anim.anim', 'walk_down');
                            this.entity.set('xform.dir', 'down');
                        }
                    }
                }
            } else {
                this.entity.set('anim.play', false)   
            }
        }
    });
    Component.register('movement', MovementComponent);

    return MovementComponent;
})

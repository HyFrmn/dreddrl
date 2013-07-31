define(['sge/component'], function(Component){
    var MovementComponent = Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.speed = 8;
            this.data.width = data.width || 640;
            this.data.height = data.height || 480;
            this.data.map = data.map || null;
            this._isKeyDown = {};
        },
        tick: function(delta){
            var vx = this.entity.get('xform.vx') * delta;
            var vy = this.entity.get('xform.vy') * delta;
            if ((Math.abs(vx) > 0) || (Math.abs(vy) > 0)){
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
            } else {
                this.entity.set('anim.play', false)   
            }
        }
    });
    Component.register('movement', MovementComponent);

    return MovementComponent;
})

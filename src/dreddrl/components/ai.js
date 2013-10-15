define(['sge',
        '../behaviour',
        '../behaviours/idle',
        '../behaviours/follow',
        '../behaviours/flee',
        '../behaviours/chase'
        ], function(sge, Behaviour){

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
define(['sge',
        '../behaviour',
        '../behaviours/idle',
        '../behaviours/follow',
        '../behaviours/flee',
        '../behaviours/chase',
        '../behaviours/enemy',
        '../behaviours/resident'
        ], function(sge, Behaviour){

    var AIComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.behaviour = null;
            this.data.region = data.region || null;
            this._behaviour = data.behaviour || 'idle';
        },
        setBehaviour: function(value, arg0, arg1, arg2){
            if (this.behaviour.setBehaviour){
                this.behaviour.setBehaviour(value, arg0, arg1, arg2)
            } else {
                this.set('behaviour', value, arg0, arg1, arg2);
            }

        },
        _get_behaviour : function(){
            return this.behaviour;
        },
        _set_behaviour : function(value, arg0, arg1, arg2){
            var behaviour = Behaviour.Create(value, this.entity, this);
            if (this.behaviour){
                this.behaviour.end();
            }
            this.behaviour = behaviour;
            this.behaviour.onStart(arg0, arg1, arg2);
            return behaviour;
        },
        tick: function(delta){
            if (this.behaviour){
                this.behaviour.tick(delta);
            }
        },
        register: function(state){
            this._super(state);
            this.set('behaviour', this._behaviour);
        }

    });
    sge.Component.register('ai', AIComponent);

    return AIComponent;
})
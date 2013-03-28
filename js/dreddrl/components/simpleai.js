define(['sge/component', 'sge/vendor/state-machine'], function(Component, StateMachine){
	var SimpleAIComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this.fsm = StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'seePlayer', from: 'idle', to: 'tracking'},
                    {name: 'losePlayer', from:'tracking', to: 'idle'}
                ],
            })
            this.data.radius = 96;
            this._idleCounter = 0;

        },
        getPC: function(){
            return this.entity.state.getEntitiesWithTag('pc')[0] || null;
        },
        getPCPosition: function(){
            var pc = this.getPC();
            var dx = this.entity.get('xform.tx') - pc.get('xform.tx');
            var dy = this.entity.get('xform.ty') - pc.get('xform.ty');
            var dist = Math.sqrt((dx*dx)+(dy*dy));
            return [pc, dx, dy, dist];
        },
        tick : function(delta){
            if (this.entity.state){
                var stateName = this.fsm.current;
                if (this.getPC()===null){
                    this.wander(delta);
                } else {
                    method = this['tick_' + stateName];
                    if (method){
                        method.call(this, delta);
                    }
                }
            }
        },
        tick_tracking: function(delta){
            var pcData = this.getPCPosition();
            var dx = pcData[1]
            var dy = pcData[2]
            var dist = pcData[3]
            if (dist >= this.data.radius){
                this.fsm.losePlayer();
            } else {
                var vx = 0;
                var vy = 0;
                vx = -64 * (pcData[1] / dist);
                vy = -64 * (dy / dist);
                this.entity.set('xform.vx', vx);
                this.entity.set('xform.vy', vy);
            }
        },
        tick_idle: function(delta){
            var pcData = this.getPCPosition();
            var dx = pcData[1]
            var dy = pcData[2]
            var dist = pcData[3]
            if (pcData[3] <= this.data.radius){
                this.fsm.seePlayer();
            } else {
                this.wander();
            }
        },
        wander: function(){
            if (this._idleCounter<0){
                this._idleCounter=30 + (Math.random() * 30);
                var vx = 0;
                var vy = 0;
                if (Math.random() > 0.5){
                    var vx = 64 * ((Math.random() * 2) - 1);
                    var vy = 64 * ((Math.random() * 2) - 1);
                }
                this.entity.set('xform.vx', vx);
                this.entity.set('xform.vy', vy);
            } else {
                this._idleCounter--;
            }
        }
	})
	Component.register('simpleai', SimpleAIComponent);

    return SimpleAIComponent;
});
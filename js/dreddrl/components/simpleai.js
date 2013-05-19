
define(['sge'], function(sge){
	var SimpleAIComponent = sge.Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.fsm = sge.vendor.StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'seePlayer', from: 'idle', to: 'tracking'},
                    {name: 'losePlayer', from:'tracking', to: 'idle'}
                ],
            })
            this.data.radius = 96;
            this._idleCounter = 0;
            this.entity.addListener('contact.tile', this.onContact.bind(this))
        },
        seePlayer: function(){
            this.data.radius = 256;
            this.fsm.seePlayer();
        },
        losePlayer: function(){
            this.data.radius = 128;
            this.fsm.losePlayer();
        },
        register: function(state){
            this._super(state);
            this.map = this.state.map;
        },
        getPC: function(){
            if (this._tracking===null){
                this._tracking = this.entity.state.getEntitiesWithTag(this.get('tracking'))[0];
            }
            return this._tracking;
        },
        getPCPosition: function(){
            var pc = this.getPC();
            var dx = this.entity.get('xform.tx') - pc.get('xform.tx');
            var dy = this.entity.get('xform.ty') - pc.get('xform.ty');
            var dist = (dx*dx)+(dy*dy);
            return [pc, dx, dy, dist];
        },
        canSeePlayer: function(dist){
            var pc = this.getPC();
            var nearby = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), this.get('radius'));
            if (_.contains(nearby, pc)){
                data = this.getPCPosition();
                if (data[3]<=(this.data.radius*this.data.radius)) {
                    return data;
                }
            }
            return null;
        },
        onContact : function(){
            if (this.fsm.current=='idle'){
                this.entity.set('xform.v', 0, 0);
                this._idleCounter += 30;
            }
        },
        tick : function(delta){
            if (this._idleCounter<0){
                this._idleCounter=30 + (Math.random() * 30);
                var vx = 64 * ((Math.random() * 2) - 1);
                var vy = 64 * ((Math.random() * 2) - 1);
                if (sge.random.unit()>0.15){
                    vx = vy = 0;
                }
                this.entity.set('xform.v', vx, vy);
            } else {
                this._idleCounter--;
            }
        }
	})
	sge.Component.register('simpleai', SimpleAIComponent);

    return SimpleAIComponent;
});

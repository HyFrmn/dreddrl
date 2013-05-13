define(['sge/component', 'sge/vendor/state-machine'], function(Component, StateMachine){
	var EnemyAIComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.data.speed = 96;
            this.data.radius = 96;
            this.fsm = StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'startTracking', from: ['idle','investigate'], to: 'tracking'},
                    {name: 'stopTracking', from:'tracking', to: 'idle'},
                    {name: 'investigateHit', from: 'idle', to:'investigate'},
                    {name: 'returnToIdle', from: '*', to: 'idle'},
                ],
                callbacks: {
                    oninvestigate: this.onInvestigate.bind(this),
                    onidle: this.onIdle.bind(this),
                    ontracking: this.onTracking.bind(this),
                }
            })
            this.entity.addListener('contact.start', this.onContact.bind(this))
            //this.entity.addListener('contact.tile', this.onContact.bind(this))
        },
        // FSM Callbacks
        onTracking: function(){
            this.set('radius', 192);
            console.log(this._tracking_vx, this._tracking_vy);
            this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
        },
        onIdle : function(event, from, to){
            this.entity.set('xform.v', 0, 0);
            this.set('radius', 96)
        },
        onInvestigate : function(event, from, to, e){
            this.set('radius', 128);
            var dx = e.get('xform.tx') - this.entity.get('xform.tx');
            var dy = e.get('xform.ty') - this.entity.get('xform.ty');
            var length = Math.sqrt((dx*dx)+(dy*dy));
            var sx = (dx/length)*this.get('speed');
            var sy = (dy/length)*this.get('speed');
            this.entity.set('xform.v', sx, sy);
            this.state.createTimeout(1, function(){
                this.fsm.returnToIdle();
            }.bind(this))
            this.entity.fireEvent('emote.msg', 'What the hell was that?');
        },
        onContact : function(e){
            if (_.contains(e.tags, 'bullet')){
                this.fsm.investigateHit(e);
            }
        },

        // Tick Functions
        tick : function(delta){
            func = this['tick_' + this.fsm.current];
            if (func!==undefined){
                func.call(this, delta);
            }
        },
        
        tick_idle : function(delta){
            if (this.canSeePlayer()){
                this.fsm.startTracking();
            }
        },

        tick_investigate : function(delta){
            if (this.canSeePlayer()){
                this.fsm.startTracking();
            }
        },

        tick_tracking : function(delta){
            if (!this.canSeePlayer()){
                this.fsm.stopTracking();
            } else {
                this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
            }
        },

        // Helper Functions
        canSeePlayer : function(){
            var result = false;
            var pc = this.state.pc;
            var dx = this.entity.get('xform.tx') - pc.get('xform.tx');
            var dy = this.entity.get('xform.ty') - pc.get('xform.ty');
            var sqrdist = (dx*dx) + (dy*dy);
            var radius = this.get('radius')
            //console.log(this.entity.id, dist);
            if (((dx*dx) + (dy*dy)) < (radius*radius)){
                var trace = this.state.physics.traceStaticTiles(Math.floor(pc.get('xform.tx') / 32),
                                                                Math.floor(pc.get('xform.ty') / 32),
                                                                Math.floor(this.entity.get('xform.tx') / 32),
                                                                Math.floor(this.entity.get('xform.ty') / 32))
                if (!trace[2]){
                    result = true;
                    var dist = Math.sqrt(sqrdist);
                    this._tracking_vx = -this.get('speed') * (dx / dist);
                    this._tracking_vy = -this.get('speed') * (dy / dist);
                }
            }
            return result;
        }
        
	})
	Component.register('enemyai', EnemyAIComponent);

    return EnemyAIComponent;
});

define(['sge/component', 'sge/vendor/state-machine'], function(Component, StateMachine){
	var EnemyAIComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.data.speed = 96;
            this.data.radius = 192;
            this.data.radiusScale = 1;
            this.fsm = StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'startTracking', from: ['idle','investigate'], to: 'tracking'},
                    {name: 'stopTracking', from:'tracking', to: 'idle'},
                    {name: 'investigateHit', from: 'idle', to:'investigate'},
                    {name: 'returnToIdle', from: '*', to: 'idle'},
                    {name: 'startFleeing', from:'*', to: 'flee'},
                    {name: 'stopFleeing', from:'flee', to:'idle'}
                ],
                callbacks: {
                    oninvestigate: this.onInvestigate.bind(this),
                    onidle: this.onIdle.bind(this),
                    ontracking: this.onTracking.bind(this),
                    onflee: this.onFlee.bind(this),
                }
            })
            this.entity.addListener('contact.start', this.onContact.bind(this))
            //this.entity.addListener('contact.tile', this.onContact.bind(this))
        },

        // FSM Callbacks
        onFlee: function(){
            this.set('radiusScale', 1.5);
            this.entity.set('xform.v', -this._tracking_vx, -this._tracking_vy);
        },
        onTracking: function(){
            this.set('radiusScale', 1.5);
            this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
        },
        onIdle : function(event, from, to){
            this.entity.set('xform.v', 0, 0);
            this.set('radiusScale', 1)
        },
        onInvestigate : function(event, from, to, e){
            this.set('radiusScale', 1.5);
            var dx = e.get('xform.vx');
            var dy = e.get('xform.vy');
            var length = Math.sqrt((dx*dx)+(dy*dy));
            var sx = (-dx/length)*this.get('speed');
            var sy = (-dy/length)*this.get('speed');
            this.entity.set('xform.v', sx, sy);
            this.createTimeout(1, function(){
                this.fsm.returnToIdle();
            }.bind(this))
            this.entity.fireEvent('emote.msg', 'What the hell was that?');
        },
        onAfterInvestigate : function(event, from, to, e){
            if (this._timeout){
                this._timeout.clear();
            }
        },
        onContact : function(e){
            if (_.contains(e.tags, 'bullet')){
                var health = this.entity.get('health.pct');
                if (health < 0.3){
                    this.fsm.startFleeing();
                } else if (this.fsm.current=='idle'){
                    this.fsm.investigateHit(e);
                }
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
                if (this.entity.get('health.pct')>0.2){
                    this.fsm.startTracking();
                } else {
                    this.fsm.startFleeing();
                }
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
                if (Math.abs(this._tracking_vx / this.get('speed')) < 0.1 || Math.abs(this._tracking_vy / this.get('speed')) < 0.1 ){
                    this.entity.fireEvent('fire');
                }
            }
        },

        tick_flee : function(delta){
            if (!this.canSeePlayer()){
                this.fsm.returnToIdle();
            } else {
                this.entity.set('xform.v', -this._tracking_vx, -this._tracking_vy);
            }
        },

        // Helper Functions
        canSeePlayer : function(){
            var result = false;
            var pc = this.state.pc;
            var dx = this.entity.get('xform.tx') - pc.get('xform.tx');
            var dy = this.entity.get('xform.ty') - pc.get('xform.ty');
            var sqrdist = (dx*dx) + (dy*dy);
            var radius = this.get('radius') * this.get('radiusScale');
            if (((dx*dx) + (dy*dy)) < (radius*radius)){
                var trace = this.state.physics.traceStaticTiles(Math.floor(pc.get('xform.tx') / 32),
                                                                Math.floor(pc.get('xform.ty') / 32),
                                                                Math.floor(this.entity.get('xform.tx') / 32),
                                                                Math.floor(this.entity.get('xform.ty') / 32),
                                                                'transparent')
                if (!trace[2]){
                    result = true;
                    var dist = Math.sqrt(sqrdist);
                    this._tracking_vx = -this.get('speed') * (dx / dist);
                    this._tracking_vy = -this.get('speed') * (dy / dist);
                }   
            }
            return result;
        },

        createTimeout: function(length, callback){
            if (this._timeout){
                this.state.removeTimeout(this._timeout);
            }
            this._timeout = this.state.createTimeout(length, callback);
            return this._timeout;
        }
        
	})
	Component.register('enemyai', EnemyAIComponent);

    return EnemyAIComponent;
});

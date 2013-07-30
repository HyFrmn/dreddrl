define(['sge', '../actions/followpath'], function(sge, FollowPathAction){
	var FactionSystem = sge.Class.extend({
        init: function(){
            this._factions = {}
        },
        update : function(faction, points){
            if (this._factions[faction]===undefined){
                this._factions[faction] = 0
            }
            this._factions[faction] += points;
            return this._factions[faction];
        },
        get : function(faction){
            if (this._factions[faction]===undefined){
                this._factions[faction] = 0
            }
            return this._factions[faction];
        }
    })

    var factionSystem = new FactionSystem();

    var EnemyAIComponent = sge.Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.data.speed = 96;
            this.data.radius = 192;
            this.data.radiusScale = 1;
            this.data.region = data.region;
            this.data.anger = 0;
            this._idleCounter = -1;
            this._followPathAction = null;
            this.data.xp = 2;
            this.fsm = sge.vendor.StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'startTracking', from: ['idle','investigate'], to: 'tracking'},
                    {name: 'stopTracking', from:'tracking', to: 'idle'},
                    {name: 'loseSight', from:'tracking', to:'investigate'},
                    {name: 'investigateHit', from: 'idle', to:'investigate'},
                    {name: 'returnToIdle', from: '*', to: 'idle'},
                    {name: 'startFleeing', from:'*', to: 'flee'},
                    {name: 'stopFleeing', from:'flee', to:'idle'}
                ],
                callbacks: {
                    oninvestigate: this.onInvestigate.bind(this),
                    onreturnToIdle: this.onIdle.bind(this),
                    ontracking: this.onTracking.bind(this),
                    onflee: this.onFlee.bind(this),
                    onloseSight: this.onLoseSight.bind(this),
                }
            })
            this.entity.addListener('entity.takeDamage', this.onDamaged.bind(this))
            this.entity.addListener('entity.kill', this.onKill.bind(this));
            this.entity.addListener('ai.investigate', this.onInvestigateLocation.bind(this));
            //this.entity.addListener('contact.tile', this.onContact.bind(this))
        },
        onKill: function(){
            factionSystem.update(this.entity.get('combat.faction'), -this.get('xp'));
        },
        // FSM Callbacks
        onFlee: function(){
            this.set('radiusScale', 1);
            this.entity.set('xform.v', -this._tracking_vx, -this._tracking_vy);
            this.entity.fireEvent('emote.msg', 'Please leave me alone.');
        },
        onTracking: function(){
            this.set('radiusScale', 1.5);
            this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
            this.entity.fireEvent('emote.msg', 'Get back here!');
            var entities = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), 128);
            _.each(entities, function(entity){
                if (entity==this.entity){
                    return;
                }
                if (entity.get('enemyai')){
                    if (entity.get('enemyai.faction')==this.entity.get('combat.faction')){
                        entity.fireEvent('ai.investigate', this._tracking_tx, this._tracking_ty);
                    }
                }
            }.bind(this));
        },
        onLoseSight: function(){
            this.set('radiusScale', 1);
            this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
            this.entity.fireEvent('emote.msg', 'Fuck! Where did he go?', 0.5);
            this.investigate(this._tracking_tx, this._tracking_ty);
        },
        onIdle : function(event, from, to){
            this.entity.set('xform.v', 0, 0);
            this.set('radiusScale', 1);
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var region = this.get('region');
            if (region){
                if (!region.test(tx, ty)){
                    this._followPathAction = new FollowPathAction(this.entity);
                    this._followPathAction.start((region.left+region.right)/2,(region.top+region.bottom)/2);
                    this._followPathAction.end = function(){
                        this._followPathAction = null;
                    }.bind(this);
                }
            }
        },
        onInvestigate : function(event, from, to, tx, ty){
            this.investigate(tx, ty);
        },
        onAfterInvestigate : function(event, from, to, e){
            if (this._timeout){
                this._timeout.clear();
            }
        },
        onInvestigateLocation : function(tx, ty){
            if (this.fsm.current=='idle'){
                this.entity.fireEvent('emote.msg', 'What was what?');
                this.fsm.investigateHit(tx, ty);
            }
        },
        onDamaged : function(damageProfile){
            if (this.active){
                var health = this.entity.get('health.pct');
                this.set('anger', -3, 'add');
                if (health < 0.3){
                    this.fsm.startFleeing();
                } else if (this.fsm.current=='idle'){
                    this.entity.fireEvent('emote.msg', 'What the hell was that?');
                    this.fsm.investigateHit(damageProfile.tx + damageProfile.vx, damageProfile.ty + damageProfile.vy);
                    this.broadcastInvestigation()
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
                if (this.isThreat(this.state.pc)){
                    if (this.entity.get('health.pct')>0.2){
                        this.fsm.startTracking();
                    } else {
                        this.fsm.startFleeing();
                    }
                    return;
                }
            }
            if (this._followPathAction){
                this._followPathAction.tick(delta);
                return;
            }
            var region = this.get('region');
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var vx = vy = 0;
            if (region){
                if (!region.test(tx, ty)){
                    this.trackPosition((region.left+region.right)/2,(region.top+region.bottom)/2);
                    this._idleCounter = 0;
                    return;
                }
            }
            if (this._idleCounter<0){
                this._idleCounter=30 + (Math.random() * 30);
                if (sge.random.unit()<0.15){
                    vx = this.get('speed') * ((Math.random() * 2) - 1);
                    vy = this.get('speed') * ((Math.random() * 2) - 1);
                    if (region){
                        while (!region.test(tx+vx,ty+vy)){
                            vx = this.get('speed') * ((Math.random() * 2) - 1);
                            vy = this.get('speed') * ((Math.random() * 2) - 1);
                        }
                    }  
                }
                this.entity.set('xform.v', vx, vy);
            } else {
                this._idleCounter--;
            }
            if (this.get('anger')<0){
                this.set('anger', delta, 'add');
            } else {
                this.set('anger', 0);
            }
        },

        tick_investigate : function(delta){
            if (this.canSeePlayer()){
                if (this.isThreat(this.state.pc)){
                    this.entity.fireEvent('emote.msg', 'Found you.', 1);

                    this.fsm.startTracking();
                }
            } else {
                this.trackPosition(this._tracking_tx, this._tracking_ty);
            }
        },

        tick_tracking : function(delta){
            if (!this.canSeePlayer()){
                this.fsm.loseSight();
            } else {
                this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
                if (Math.abs(this._tracking_vx / this.get('speed')) < 0.1 || Math.abs(this._tracking_vy / this.get('speed')) < 0.1 ){
                    this.entity.fireEvent('weapon.fire');
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
        isThreat : function(){
            if (!this.entity.get('combat')){
                return false;
            }
            var faction = this.entity.get('combat.faction');
            if (faction){
                var factionFactor = factionSystem.get(faction);
                var angerFactor = this.get('anger');
                return Boolean((factionFactor+angerFactor)<-4);
            } else {
                return true;
            }
        },

        canSeePlayer : function(){
            var result = false;
            var pc = this.state.pc;
            var tracking_tx = pc.get('xform.tx');
            var tracking_ty = pc.get('xform.ty');
            var dx = this.entity.get('xform.tx') - tracking_tx;
            var dy = this.entity.get('xform.ty') - tracking_ty;
            var sqrdist = (dx*dx) + (dy*dy);
            var radius = this.get('radius') * this.get('radiusScale');
            if (((dx*dx) + (dy*dy)) < (radius*radius)){
                var trace = this.state.physics.traceStaticTiles(Math.floor(pc.get('xform.tx') / 32),
                                                                Math.floor(pc.get('xform.ty') / 32),
                                                                Math.floor(this.entity.get('xform.tx') / 32),
                                                                Math.floor(this.entity.get('xform.ty') / 32),
                                                                'transparent');
                if (!trace[2]){
                    result = true;
                    var dist = Math.sqrt(sqrdist);
                    this._tracking_tx = tracking_tx;
                    this._tracking_ty = tracking_ty;
                    this._tracking_dist = dist;
                    this._tracking_vx = -this.get('speed') * (dx / dist);
                    this._tracking_vy = -this.get('speed') * (dy / dist);
                }   
            }
            return result;
        },

        trackPosition : function(tx, ty){
            var dx = this.entity.get('xform.tx') - tx;
            var dy = this.entity.get('xform.ty') - ty;
            var length = Math.sqrt((dx*dx)+(dy*dy));
            if (length<5){
                this.fsm.returnToIdle();
            } else {
                var sx = (-dx/length)*this.get('speed');
                var sy = (-dy/length)*this.get('speed');
                this.entity.set('xform.v', sx, sy);
            }  
        },

        investigate : function(tx, ty){
            this.set('radiusScale', 1.5);
            this.set('anger', -5, 'add');
            this.trackPosition(tx, ty);       
        },

        broadcastInvestigation : function(tx, ty){
            var entities = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), 128);
            _.each(entities, function(entity){
                if (entity==this.entity){
                    return;
                }
                if (entity.get('combat') && entity.get('enemyai')){
                    if (entity.get('combat.faction')==this.entity.get('combat.faction')){
                        entity.fireEvent('ai.investigate', tx, ty);
                    }
                }
            }.bind(this));
        },

        createTimeout: function(length, callback){
            if (this._timeout){
                this.state.removeTimeout(this._timeout);
            }
            this._timeout = this.state.createTimeout(length, callback);
            return this._timeout;
        }
        
	})
	sge.Component.register('enemyai', EnemyAIComponent);

    return EnemyAIComponent;
});

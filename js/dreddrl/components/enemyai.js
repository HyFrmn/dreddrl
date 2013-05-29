define(['sge'], function(sge){
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
            this.data.faction = data.faction || null;
            this.data.region = data.region;
            this.data.anger = 0;
            this._idleCounter = -1;
            this.data.xp = 2;
            this.fsm = sge.vendor.StateMachine.create({
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
                    onreturnToIdle: this.onIdle.bind(this),
                    ontracking: this.onTracking.bind(this),
                    onflee: this.onFlee.bind(this),
                    onstopTracking: this.onLoseSight.bind(this)
                }
            })
            this.entity.addListener('entity.takeDamage', this.onDamaged.bind(this))
            this.entity.addListener('entity.kill', this.onKill.bind(this));
            this.entity.addListener('ai.investigate', this.onInvestigateLocation.bind(this));
            //this.entity.addListener('contact.tile', this.onContact.bind(this))
        },
        onKill: function(){
            factionSystem.update(this.get('faction'), -this.get('xp'));
            console.log('Faction:', factionSystem.get(this.get('faction')));
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
                    if (entity.get('enemyai.faction')==this.get('faction')){
                        console.log('Signal Comrad');
                        entity.fireEvent('ai.investigate', this._tracking_tx, this._tracking_ty);
                    }
                }
            }.bind(this));
        },
        onLoseSight: function(){
            this.set('radiusScale', 1.25);
            this.entity.set('xform.v', this._tracking_vx, this._tracking_vy);
            this.createTimeout(this._tracking_dist / this.get('speed'), function(){
                this.entity.set('xform.v', 0, 0);
                this.entity.fireEvent('emote.msg', 'Great, I lost him.', 1);
            }.bind(this));
            this.entity.fireEvent('emote.msg', 'Fuck! Where did he go?', 0.5);
        },
        onIdle : function(event, from, to){
            this.entity.set('xform.v', 0, 0);
            this.set('radiusScale', 1)
        },
        onInvestigate : function(event, from, to, tx, ty){
            this.set('radiusScale', 1.5);
            this.set('anger', -5, 'add');
            var dx = this.entity.get('xform.tx') - tx;
            var dy = this.entity.get('xform.ty') - ty;
            var length = Math.sqrt((dx*dx)+(dy*dy));
            var sx = (-dx/length)*this.get('speed');
            var sy = (-dy/length)*this.get('speed');
            this.entity.set('xform.v', sx, sy);
            this.createTimeout(1, function(){
                this.fsm.returnToIdle();
            }.bind(this));
            var entities = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), 128);
            _.each(entities, function(entity){
                if (entity==this.entity){
                    return;
                }
                if (entity.get('enemyai')){
                    if (entity.get('enemyai.faction')==this.get('faction')){
                        console.log('Signal Comrad');
                        entity.fireEvent('ai.investigate', tx, ty);
                    }
                }
            }.bind(this));
        },
        onAfterInvestigate : function(event, from, to, e){
            if (this._timeout){
                this._timeout.clear();
            }
        },
        onInvestigateLocation : function(tx, ty){
            console.log('SIGNAL', this.fsm.current);
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
                    this.fsm.investigateHit(damageProfile.tx, damageProfile.ty);
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
            var region = this.get('region');
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');
            var vx = vy = 0;
            if (region){
                if (!region.test(tx, ty)){
                    var dx = tx - ((region.right-region.left)/2 + region.left);
                    var dy = ty - ((region.bottom-region.top)/2 + region.top);
                    var length = Math.sqrt((dx*dx)+(dy*dy));
                    vx = -(dx / length) * this.get('speed');
                    vy = -(dy / length)  * this.get('speed'); 
                    this.entity.set('xform.v', vx, vy);
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
                    this.fsm.startTracking();
                }
            }
        },

        tick_tracking : function(delta){
            if (!this.canSeePlayer()){
                this.fsm.stopTracking();
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
            //console.log('Threat', (factionSystem.get(this.get('faction'))/-4));
            if (this.get('faction')){
                var factionFactor = factionSystem.get(this.get('faction'));
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

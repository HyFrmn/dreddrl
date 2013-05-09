
define(['sge/component', 'sge/vendor/state-machine'], function(Component, StateMachine){
	var SimpleAIComponent = Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.fsm = StateMachine.create({
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
            var stateName = this.fsm.current;
            if (this.getPC()===null){
                this.wander(delta);
            } else {
                method = this['tick_' + stateName];
                if (method){
                    method.call(this, delta);
                }
            }
            
        },
        tick_tracking: function(delta){
            var pcData = this.getPCPosition();
            var dx = pcData[1]
            var dy = pcData[2]
            var dist = pcData[3]
            if (dist >= this.data.radius){
                this.losePlayer();
            } else {
                var vx = 0;
                var vy = 0;
                vx = -64 * (dx / dist);
                vy = -64 * (dy / dist);
                this.entity.set('xform.vx', vx);
                this.entity.set('xform.vy', vy);
                if (Math.abs(dx) < 5 || Math.abs(dy)<5){
                    this.entity.fireEvent('fire');
                }
            }
        },
        tick_idle: function(delta){
            if (this.get('tracking')!==null){
                var data = this.canSeePlayer()
                if (data!==null){
                    this.seePlayer();
                } else {
                    this.wander();
                }
            } else {
                this.wander();
            }
        },
        wander: function(){
            if (this._idleCounter<0){
                this._idleCounter=30 + (Math.random() * 30);
                var vx = 64 * ((Math.random() * 2) - 1);
                var vy = 64 * ((Math.random() * 2) - 1);
                /*
                var hasDir = false;
                var tx = this.entity.get('xform.tx');
                var ty = this.entity.get('xform.ty');
                for (var i=0;i<5;i++){
                    if (Math.random() > 0.5){
                        var vx = 64 * ((Math.random() * 2) - 1);
                        var vy = 64 * ((Math.random() * 2) - 1);
                    }
                    if (this.data.territory!==undefined){
                        var tile = this.map.getTile(Math.floor((tx+vx)/32),Math.floor((ty+vy)/32))
                        if (tile){
                            if (tile.data.territory==this.data.territory){
                                break;
                            }
                        }
                        vx = 0;
                        vy = 0;
                    } else {
                        break;
                    }
                    
                }
                */
                this.entity.set('xform.v', vx, vy);
            } else {
                /*
                var tx = this.entity.get('xform.tx');
                var ty = this.entity.get('xform.ty');
                var vx = this.entity.get('xform.vx');
                var vy = this.entity.get('xform.vy');
                if (this.data.territory!==undefined){
                    var tile = this.map.getTile(Math.floor((tx+vx)/32),Math.floor((ty+vy)/32))
                    if (tile){
                        if (tile.data.territory!=this.data.territory){
                            this._idleCounter=-1;
                            this.entity.set('xform.vx', 0);
                            this.entity.set('xform.vy', 0);
                        }
                    }
                }
                //*/
                this._idleCounter--;
            }
        }
	})
	Component.register('simpleai', SimpleAIComponent);

    return SimpleAIComponent;
});

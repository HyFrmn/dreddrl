
define(['sge'], function(sge){
	var SimpleAIComponent = sge.Component.extend({
		init: function(entity, data){
            this._super(entity, data);
            this._tracking = null;
            this.data.tracking = data.tracking || null;
            this.data.territory = data.territory;
            this.data.speed = data.speed || 64;
            this.data.region = data.region || null;
            this.fsm = sge.vendor.StateMachine.create({
                initial: 'idle',
                events: [
                    {name: 'hearDistress', from: 'idle', to: 'fleeing'},
                    {name: 'returnToIdle', from:'*', to: 'idle'}

                ],
                callbacks : {
                    onreturnToIdle: this.onIdle.bind(this),
                    onfleeing: this.onFlee.bind(this),
                }
            })
            this.data.radius = 96;
            this._idleCounter = 0;
            this.entity.addListener('contact.tile', this.onContact.bind(this));
            this.entity.addListener('hear.distress', function(tx, ty){
                if (this.fsm.current == 'idle'){
                    this.fsm.hearDistress(tx, ty);
                } else {
                    //this.onFleeUpdate(tx, ty);
                }
            }.bind(this));
        },
        register: function(state){
            this._super(state);
            this.map = this.state.map;
        },
        onContact : function(){
            if (this.fsm.current=='idle'){
                this.entity.set('xform.v', 0, 0);
                this._idleCounter += 30;
            }
        },
        onIdle : function(event, from, to){
            this.entity.set('xform.v', 0, 0);
        },
        onFleeUpdate : function(cx, cy){
            var dx = this.entity.get('xform.tx') - cx;
            var dy = this.entity.get('xform.ty') - cy;
            var length = Math.sqrt((dx*dx)+(dy*dy));
            var vx = dx / length;
            var vy = dy / length;
            this.entity.set('xform.v', vx * 2 * this.get('speed'), vy * 2 * this.get('speed'));
        },
        onFlee : function(event, from, to, cx, cy){
            this.onFleeUpdate(cx, cy);  
            this.state.createTimeout(3, function(){
                this.fsm.returnToIdle();
            }.bind(this));
        },
        tick : function(delta){
            if (this.fsm.current=='idle'){
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
            }
        }
	})
	sge.Component.register('simpleai', SimpleAIComponent);

    return SimpleAIComponent;
});

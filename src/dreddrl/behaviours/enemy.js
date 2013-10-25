define(['sge','../behaviour'],function(sge, Behaviour){
	var WaitBehaviour = Behaviour.Add('wait', {
        onStart: function(options){
            options = options || {};
            this.timeout = options.timeout || -1;
            this._startTime = this.state.getTime();
            this.entity.set('movement.v', 0, 0);
        },


        tick: function(delta){
        	if (this.timeout>0){
        		if(this.state.getTime()-this._startTime>this.timeout){
        			this.end();
        		}
        	}
        }
    })

	var TrackBehaviour = Behaviour.Add('track', {
        onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 256;
            this._timeout = -1;
        },

        tick: function(delta){

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);
            var nx = deltax/dist;
            var ny = deltay/dist;
            if (dist<this.dist){
	            this.entity.set('movement.v', nx, ny);
	            this._timeout=-1;
    		} else {
    			if (this._timeout>0){
    				if (this.state.getTime()-this._timeout>this.timeout){
    					this.end();
    				}
    			} else {
    				this._timeout = this.state.getTime();
    			}
    		}
        }
    })

    var AttackBehaviour =  Behaviour.Add('attack', {
    	onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 128;
            this._startTime = this.state.getTime();
            this.end();
        },

        tick: function(delta){
        	var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);

            if (Math.abs(deltax)<10||Math.abs(deltay)<10&&dist<this.dist){
            	this.entity.fireEvent('weapon.fire');
            }
        }
    })

    var AttackOnSightBehaviour =  Behaviour.Add('attackonsight', {
        onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 128;
            this._startTime = this.state.getTime();
            this.end();
        },

        tick: function(delta){
            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);

            if (dist<this.dist){
                this.setBehaviour('track+attack', {timeout: 1, target: this.target}).
                    then(this.parent.deferBehaviour('wait+attack+attackonsight', {timeout: 1, target: this.target})).
                    then(this.parent.deferBehaviour('idle+attackonsight', {timeout: 1, target: this.target}));
            }
        }
    })

	var EnemyBehaviour = Behaviour.Add('enemy', {
        /**
        * Character:
        *    Attacks when hit.
        *    Chases enemy when hit.
        *    Flees from enemy when damaged.
        *
        *
        */
	    deferBehaviour: function(behaviour, arg0, arg1, arg2, arg3, arg4){
			var func = function(){
				
				var deferred = new sge.vendor.when.defer();
				this.setBehaviour(behaviour, arg0, arg1, arg2, arg3, arg4)
					.then(deferred.resolve);
				return deferred.promise;
			}.bind(this)
			return func;
		},

        _setBehaviourCallback: function(behaviour, arg0, arg1, arg2, arg3, arg4){
            this.setBehaviourCallback(behaviour, arg0, arg1, arg2, arg3, arg4);
        },

        setBehaviour: function(behaviour, arg0, arg1, arg2, arg3, arg4){
            if (this._currentBehaviour){
                this._currentBehaviour.end();
            }
            this._currentBehaviour = Behaviour.Create(behaviour, this.entity, this);
            this._currentBehaviour.onStart(arg0, arg1, arg2, arg3, arg4);
            return this._currentBehaviour;
        },
        onDamaged: function(dp){
            this.setBehaviour('track+attack', {timeout: 1, target: this.entity.state.pc}).
	            then(this.deferBehaviour('wait+attack+attackonsight', {timeout: 1, target: this.entity.state.pc})).
	            then(this.deferBehaviour('idle+attackonsight', {timeout: 1, target: this.entity.state.pc}));
            this.broadcastEvent('ai.setBehaviour', 'track+attackonsight',  {timeout: 1, target: this.entity.state.pc})
        },
        broadcastEvent : function(event, arg0, arg1, arg2, arg3, arg4){
            var entities = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), 128);
            _.each(entities, function(entity){
                if (entity==this.entity){
                    return;
                }
                if (entity.get('ai')){    
                    entity.fireEvent(event, arg0, arg1, arg2, arg3, arg4);
                }
            }.bind(this));
        },
        onStart: function(){
        	this._currentBehaviour = null;
        	this.setBehaviour('idle');
            this.entity.addListener('entity.takeDamage', this.onDamaged.bind(this));
            this.entity.addListener('ai.setBehaviour', this.setBehaviour.bind(this));
        },
        seePlayer: function(){
        	var pc = this.entity.state.pc;

        	var targetx = pc.get('xform.tx');
            var targety = pc.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);
        	if (dist<128){
        		return pc;
        	}
        	return null;
        },

        tick: function(delta){
            //Determine Behaviour
            var enemy = this.seePlayer();
            if (this._currentBehaviour){
                this._currentBehaviour.tick(delta);
            }

        }
    })
	return EnemyBehaviour
})
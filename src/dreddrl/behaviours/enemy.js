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
            this.dist = options.dist || 128;
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
            this._startTime = this.state.getTime();
        },

        tick: function(delta){
        	var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);

            if (Math.abs(deltax)<10||Math.abs(deltay)<10){
            	this.entity.fireEvent('weapon.fire');
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


        setBehaviour: function(behaviour, arg0, arg1, arg2, arg3, arg4){
            if (this._currentBehaviour){
                this._currentBehaviour.end();
            }
            this._currentBehaviour = Behaviour.Create(behaviour, this.entity);
            this._currentBehaviour.onStart(arg0, arg1, arg2, arg3, arg4);
            return this._currentBehaviour;
        },
        onDamaged: function(dp){
            this.setBehaviour('track+attack', {timeout: 1, target: this.entity.state.pc}).
	            then(this.deferBehaviour('wait+attack', {timeout: 1, target: this.entity.state.pc})).
	            then(this.deferBehaviour('idle'));
        },
        onStart: function(){
        	this._currentBehaviour = null;
        	this.setBehaviour('idle');
            this.entity.addListener('entity.takeDamage', this.onDamaged.bind(this));
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
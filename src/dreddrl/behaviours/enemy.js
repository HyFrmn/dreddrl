define(['sge','../behaviour', './attack', './track'],function(sge, Behaviour){
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
                var traceResults = this.state.map.traceStatic(this.entity.get('xform.tx'),this.entity.get('xform.ty'),entity.get('xform.tx'),this.entity.get('xform.ty'));
                if (!traceResults[2]){
                    if (entity.get('ai')){
                        if (entity.get('stats.faction')==this.entity.get('stats.faction')){
                            entity.fireEvent(event, arg0, arg1, arg2, arg3, arg4);
                        }
                    }
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
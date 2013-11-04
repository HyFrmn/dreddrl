define(['sge','../behaviour', './goto'], function(sge, Behaviour){
	var ResidentBehaviour = Behaviour.Add('resident', {
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

        broadcastEvent : function(event, arg0, arg1, arg2, arg3, arg4){
            var entities = this.state.findEntities(this.entity.get('xform.tx'), this.entity.get('xform.ty'), 128);
            _.each(entities, function(entity){
                if (entity==this.entity){
                    return;
                }
                var traceResults = this.state.map.traceStatic(this.entity.get('xform.tx'),this.entity.get('xform.ty'),entity.get('xform.tx'),this.entity.get('xform.ty'));
                if (!traceResults[2]){
                    if (entity.get('ai')){    
                        entity.fireEvent(event, arg0, arg1, arg2, arg3, arg4);
                    }
                }
            }.bind(this));
        },

        onStart: function(){
        	this._currentBehaviour = null;
        	this.setBehaviour('idle');
            this.entity.addListener('ai.setBehaviour', this.setBehaviour.bind(this));
        },
        
        tick: function(delta){
            //Determine Behaviour
            if (this._currentBehaviour){
                this._currentBehaviour.tick(delta);
            }

        }
    })
})
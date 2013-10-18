define(['sge'], function(sge){
	var Behaviour = sge.Class.extend({
        init: function(entity){
            this.entity = entity;
            this.state = entity.state;
            this.deferred = new sge.vendor.when.defer();
        },
        tick: function(delta){},
        then: function(value){return this.deferred.promise.then(value)},
        onStart: function(){},
        onEnd: function(){},
        end: function(){
            this.onEnd();
            this.deferred.resolve();
        },
    });

    var CompoundBehaviour = Behaviour.extend({
        init: function(entity){
            this._super(entity);
            this._behaviours = [];
        },
        add: function(behaviour){
            var b = Behaviour.Create(behaviour, this.entity);
            b.end = function(){
                this.onEnd();
                this.deferred.resolve();
            }.bind(this);
            this._behaviours.push(b);
        },
        onStart: function(arg0, arg1, arg2, arg3, arg4){
            for (var i = this._behaviours.length - 1; i >= 0; i--) {
                this._behaviours[i].onStart(arg0, arg1, arg2, arg3, arg4)
            }
        },
        onEnd: function(arg0, arg1, arg2, arg3, arg4){
            for (var i = this._behaviours.length - 1; i >= 0; i--) {
                this._behaviours[i].onEnd(arg0, arg1, arg2, arg3, arg4)
            }
        },
        tick: function(delta){
            for (var i = this._behaviours.length - 1; i >= 0; i--) {
                this._behaviours[i].tick(delta)
            }
        }
    })

	Behaviour._classMap = {};
    Behaviour.Add = function(type, data){
        klass = Behaviour.extend(data);
        Behaviour._classMap[type] = klass;
        return klass;
    }
    Behaviour.Create = function(type, entity){
        if (type.indexOf('+')>=0){
            var behaviour = new CompoundBehaviour(entity);
            types = type.split('+')
            for (var i = types.length - 1; i >= 0; i--) {
                var b = behaviour.add(types[i]);
            }
            return behaviour;
        }
        return new Behaviour._classMap[type](entity);
    }









    return Behaviour;
})
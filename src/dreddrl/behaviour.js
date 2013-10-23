define(['sge'], function(sge){
	var Behaviour = sge.Class.extend({
        init: function(entity, parent){
            this.entity = entity;
            this.parent = parent;
            this.state = entity.state;
            this.deferred = new sge.vendor.when.defer();
            this._ended = false;
        },
        setBehaviour: function(behaviour, arg0, arg1, arg2){
            return this.parent.setBehaviour(behaviour, arg0, arg1, arg2);
        },
        tick: function(delta){},
        then: function(value){return this.deferred.promise.then(value)},
        onStart: function(){},
        onEnd: function(){
            console.log('End Behaviour:', this.type);
            this._ended = true;
        },
        end: function(){
            this.onEnd();
            this.deferred.resolve();
        },
    });

    var CompoundBehaviour = Behaviour.extend({
        init: function(entity, parent){
            this._super(entity, parent);
            this._behaviours = [];
            this._promises = [];
        },
        add: function(behaviour){
            var b = Behaviour.Create(behaviour, this.entity, this.parent);
            this._promises.push(b.deferred.promise);
            this._behaviours.push(b);
        },
        _init: function(){
            this.promise = sge.vendor.when.all(this._promises).then(this.end.bind(this));
        },
        then: function(value){
            return this.promise.then(value);
        },
        onStart: function(arg0, arg1, arg2, arg3, arg4){
            for (var i = this._behaviours.length - 1; i >= 0; i--) {
                this._behaviours[i].onStart(arg0, arg1, arg2, arg3, arg4)
            }
        },
        end: function(arg0, arg1, arg2, arg3, arg4){
            for (var i = this._behaviours.length - 1; i >= 0; i--) {
                if (!this._behaviours[i]._ended){
                    this._behaviours[i].onEnd(arg0, arg1, arg2, arg3, arg4);
                }
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
    Behaviour.Create = function(type, entity, parent){
        if (type.indexOf('+')>=0){
            var behaviour = new CompoundBehaviour(entity, parent);
            types = type.split('+')
            for (var i = types.length - 1; i >= 0; i--) {
                var b = behaviour.add(types[i]);
            }
            behaviour._init();
            
        } else {
            var behaviour = new Behaviour._classMap[type](entity, parent);
        }
        behaviour.type = type;
        return behaviour;
    }









    return Behaviour;
})
define(['sge'], function(sge){
	var Behaviour = sge.Class.extend({
        init: function(entity){
            this.entity = entity;
        },
        tick: function(delta){},
        onStart: function(){},
        onEnd: function(){}
    });

	Behaviour._classMap = {};
    Behaviour.Add = function(type, data){
        klass = Behaviour.extend(data);
        Behaviour._classMap[type] = klass;
        return klass;
    }
    Behaviour.Create = function(type, entity){
        return new Behaviour._classMap[type](entity);
    }
    
    return Behaviour;
})
define(['sge', '../config'], function(sge, config){
    var Chara = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
        }
    });
    sge.Component.register('chara', Chara);
    return Chara
})

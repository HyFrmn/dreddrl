define(['sge'], function(sge){
    var Interact = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.pickup = this.pickup.bind(this);
        },
    });
    sge.Component.register('interact', Interact);
    return Interact
})
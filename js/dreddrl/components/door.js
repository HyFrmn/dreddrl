define(['sge'], function(sge){
    var Door = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.pickup = this.pickup.bind(this);
            this.entity.addListener('contact.start', this.pickup);
        },
        pickup: function(){
            this.entity.fireEvent('kill');
        },
    	register: function(state){
			this.state = state;
		},
		unregister: function(){
			this.state = null;
		}
    });
    sge.Component.register('door', Door);
    return Door
})
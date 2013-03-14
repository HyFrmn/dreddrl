define(['sge'], function(sge){
    var Dialog = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.dialog = data.dialog || "I've got nothing to say to you Judge.";
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){
            this.state.startDialog(this.get('dialog'));
        },
    	register: function(state){
			this.state = state;
            this.map = state.map;
		},
		unregister: function(){
			this.state = null;
            this.map = null;
		}
    });
    sge.Component.register('dialog', Dialog);
    return Dialog
})
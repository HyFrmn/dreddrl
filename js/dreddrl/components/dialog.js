define(['sge', '../action'], function(sge, Action){
    var Dialog = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.dialog = data.dialog || "I've got nothing to say to you Judge.";
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){
            var dialog = this.get('dialog');
            if (typeof dialog === 'string'){
                this.state.startDialog(this.get('dialog'));
            } else{
                console.log(dialog)
                dialogData = dialog.slice(0);
                var type = dialogData.shift();
                var action = Action.Load({type: type, args: dialogData});
                action.run(this.state);
            }
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
define(['sge','../action'], function(sge, Action){
	var DialogAction = Action.extend({
		init: function(data){
			this._super(data);
			this.async = true;
		},
		start: function(text){
			this.state.startDialog(text);
		}
	})
	Action.register('dialog', DialogAction);
	return DialogAction
})
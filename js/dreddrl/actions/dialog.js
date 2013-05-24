define(['sge','../action'], function(sge, Action){
	var DialogAction = Action.extend({
		start: function(text){
			this.ctx.state.startDialog(text);
		}
	})
	Action.register('dialog', DialogAction);
	return DialogAction
})

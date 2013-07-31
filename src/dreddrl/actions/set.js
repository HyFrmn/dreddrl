define(['sge','../action'], function(sge, Action){
	var SetAction = Action.extend({
		start: function(path, value, method){
			var val = this.evalExpr(value, this.ctx);
			console.log('Set:', this.ctx, path, val);
			this.setAttr(path, val, method);
		}
	})
	Action.register('set', SetAction);
	return SetAction
})

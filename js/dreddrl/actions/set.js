define(['sge','../action'], function(sge, Action){
	var SetAction = Action.extend({
		start: function(path, value, method){
			var val = this.evalExpr(value, this.ctx);
			this.setAttr(path, val, method);
		}
	})
	Action.register('set', SetAction);
	return SetAction
})

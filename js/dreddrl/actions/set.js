define(['sge','../action'], function(sge, Action){
	var SetAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(path, value, method){
			var val = this.evalExpr(value, this.entity);
			this.setAttr(path, val, method);
		}
	})
	Action.register('set', SetAction);
	return SetAction
})

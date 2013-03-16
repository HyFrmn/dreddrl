define(['sge','../action'], function(sge, Action){
	var SetAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(path, value){
			var val = this.evalExpr(value);
			this.setAttr(path, value);
		}
	})
	Action.register('set', SetAction);
	return SetAction
})
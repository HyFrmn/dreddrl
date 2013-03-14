define(['sge','../action'], function(sge, Action){
	var SetAction = Action.extend({
		init: function(data){
			this._super(data);
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
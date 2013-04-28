define(['sge','../action'], function(sge, Action){
	var IfAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(expr, trueActions, falseActions){
	        var parsedExpr = this.parseExpr(expr, this.entity);
	        var result = Boolean(this.evalExpr(parsedExpr, this.entity));
	        var actionList = [];
	        if(result) {
	            actionList = trueActions.slice(0);
	        } else {
	            actionList = falseActions.slice(0);
	        }
	        _.each(actionList, function(actionData) {
	        	actionData = actionData.slice(0);
	            var type = actionData.shift();
                var action = Action.Load(this.entity, {type: type, args: actionData});
                action.run(this.state);
	        }.bind(this));
		}
	});
	Action.register('if', IfAction);
	return IfAction
})

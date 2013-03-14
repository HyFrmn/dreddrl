define(['sge','../action'], function(sge, Action){
	var IfAction = Action.extend({
		init: function(data){
			this._super(data);
			this.async = true;
		},
		start: function(expr, trueActions, falseActions){
	        var parsedExpr = this.parseExpr(expr);
	        var result = Boolean(this.evalExpr(parsedExpr));
	        console.log(result);
	        var actionList = [];
	        if(result) {
	            actionList = trueActions.slice(0);
	        } else {
	            actionList = falseActions.slice(0);
	        }
	        _.each(actionList, function(actionData) {
	        	actionData = actionData.slice(0);
	        	console.log(actionData);
	            var type = actionData.shift();
                var action = Action.Load({type: type, args: actionData});
                action.run(this.state);
	        }.bind(this));
		}
	});
	Action.register('if', IfAction);
	return IfAction
})
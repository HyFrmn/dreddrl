define(['sge','../action'], function(sge, Action){
	var IfAction = Action.extend({
		start: function(expr, trueActions, falseActions){
	        var parsedExpr = this.parseExpr(expr, this.ctx);
	        console.log('Expr', parsedExpr);
	        var result = Boolean(this.evalExpr(parsedExpr, this.ctx));
	        var actionList = [];
	        if(result) {
	            actionList = trueActions.slice(0);
	        } else {
	            actionList = falseActions.slice(0);
	        }
	        var action = Action.Factory(this.ctx, actionList);
	        this.chain(action);
		}
	});
	Action.register('if', IfAction);
	return IfAction
})

define(['sge','../action'], function(sge, Action){
	var SwitchAction = Action.extend({
		start: function(){
			var args = Array.prototype.slice.call(arguments);
			var expr = args.shift()
	        var parsedExpr = this.parseExpr(expr, this.ctx);
	        var result = parseInt(this.evalExpr(parsedExpr, this.ctx));
	        var actionList = args[result];
	        var action = Action.Factory(this.ctx.get('entity'), actionList);
	        this.chain(action);
		}
	});
	Action.register('switch', SwitchAction);
	return SwitchAction
})

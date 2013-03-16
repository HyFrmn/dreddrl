define(['sge','../action'], function(sge, Action){
	var SwitchAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(){
			var args = Array.prototype.slice.call(arguments);
			var expr = args.shift()
	        var parsedExpr = this.parseExpr(expr, this.entity);
	        var result = parseInt(this.evalExpr(parsedExpr, this.entity));
	        console.log(result);
	        var actionList = args[result];
	        _.each(actionList, function(actionData) {
	        	actionData = actionData.slice(0);
	        	console.log(actionData);
	            var type = actionData.shift();
                var action = Action.Load(this.entity, {type: type, args: actionData});
                action.run(this.state);
	        }.bind(this));
		}
	});
	Action.register('switch', SwitchAction);
	return SwitchAction
})
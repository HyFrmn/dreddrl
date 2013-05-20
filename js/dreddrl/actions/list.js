define(['sge','../action'], function(sge, Action){
	var ListAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(){
			var args = Array.prototype.slice.call(arguments);
	        var actionList = args[0];
	        console.log(actionList);
	        _.each(actionList, function(actionData) {
	        	actionData = actionData.slice(0);
	            var type = actionData.shift();
                var action = Action.Load(this.entity, {type: type, args: actionData});
                action.run(this.state);
	        }.bind(this));
		}
	});
	Action.register('list', ListAction);
	return ListAction
})

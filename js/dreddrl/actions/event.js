define(['sge','../action'], function(sge, Action){
    var EventAction = Action.extend({
		start: function(){
            var args = Array.prototype.slice.call(arguments);
            var entityId = args.shift();
            var entity = this.getEntity(entityId);
            entity.fireEvent.apply(entity, _.map(args, function(arg){
                var expr = this.parseExpr(arg);
                return expr;
            }.bind(this)));
		}
	});
	Action.register('event', EventAction);
	return EventAction
})

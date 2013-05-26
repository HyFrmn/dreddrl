define(['sge','../action'], function(sge, Action){
    var EventAction = Action.extend({
		start: function(){
            var args = Array.prototype.slice.call(arguments);
            var entityId = args.shift();
            if (entityId=='this'){
            	var entity = this.ctx.get('entity');
            } else if (entityId.match(/encounter\./)){
            	var entity = this.ctx.get(entityId);
            } else {
				var entity = this.ctx.get('entity').state.getEntityWithTag(entityId);
			}
            entity.fireEvent.apply(entity, _.map(args, function(arg){
                var expr = this.parseExpr(arg);
                return expr;
            }.bind(this)));
		}
	});
	Action.register('event', EventAction);
	return EventAction
})

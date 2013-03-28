define(['sge','../action'], function(sge, Action){
    var EventAction = Action.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.async = true;
		},
		start: function(){
            var args = Array.prototype.slice.call(arguments);
            var entityId = args.shift();
            var eventName = args.shift();
			var entity = this.state.getEntityWithTag(entityId);
            entity.fireEvent(eventName);
		}
	});
	Action.register('event', EventAction);
	return EventAction
})
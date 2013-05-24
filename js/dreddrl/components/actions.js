define(['sge', '../action'], function(sge, Action){
    var ActionComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            var keys = Object.keys(data);
            for (var i = keys.length - 1; i >= 0; i--) {
                var callbackData = data[keys[i]].slice(0);
                var callback = function(){
                    var actionData = callbackData.slice(0);
                    var action = Action.Factory(this.entity, actionData);
                    action.run(this.state);
                }.bind(this);
                this.data[keys[i]] = callback;
                this.entity.addListener(keys[i], callback);
            }
        },
        __set_value : function(evt, actionData){

            this._addCallback(evt, actionData);
        },
        _addCallback : function(evt, actionData){
            if (this.data[evt]!==undefined){
                this.entity.removeListener(evt, this.data[evt]);
            }
            var callback = function(){
                var tmpActionData = actionData.slice(0);
                var action = Action.Factory(this.entity, actionData);
                action.run(this.state);
            }.bind(this);
            this.data[evt] = callback;
            this.entity.addListener(evt, callback);
        },
    	register: function(state){
			this.state = state;
            this.map = state.map;
		},
		unregister: function(){
			this.state = null;
            this.map = null;
		}
    });
    sge.Component.register('actions', ActionComponent);
    return ActionComponent
})

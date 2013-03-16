define(['sge'], function(sge){
	var EncounterComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.encounter = data.encounter
			this.data.status = data.status || 0;
		},
		_get_status : function(){
			return this.encounter.status;
		},
		_set_status : function(status){
			this.encounter.status = status;
			console.log('Encounter', this.encounter);
			return this.encounter.status;
		}
	});
	sge.Component.register('encounter', EncounterComponent);
	return EncounterComponent;
})
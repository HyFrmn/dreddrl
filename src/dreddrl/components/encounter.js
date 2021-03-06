define(['sge'], function(sge){
	var EncounterComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.encounter = data.encounter.add(this);
			this.data.status = data.status || 0;
		},
		_get_status : function(){
			return this.encounter.status;
		},
		_set_status : function(status){
			this.encounter.status = status;
			this.encounter.update(status);
			return this.encounter.status;
		},
		__get_value : function(path){
			var subpaths = path.split('.');
			var name = subpaths.shift();
			var r = null;
			r = this.encounter.entities[name];
			if (!r){
				r = this.encounter.items[name];
			}
			if (subpaths.length){
				r = r.get(subpaths.join('.'))
			}
			return r;
		}
	});
	sge.Component.register('encounter', EncounterComponent);
	return EncounterComponent;
})

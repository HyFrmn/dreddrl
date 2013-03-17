define(['sge'], function(sge){
	var Encounter = sge.Class.extend({
		init: function(block){
			this.block = block;
			this.state = block.state;
			this.factory = block.factory;
			this.status = 0;
			this.total = 1;
			this.start();
		},
		start: function(){

		},
		finish: function(){

		},
		tick: function(){
			/**
			*
			*/

		}
	});

	var RescueEncounter = Encounter.extend({
		start: function(){

		}
	});



	return Encounter
})
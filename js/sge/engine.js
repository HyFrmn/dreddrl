define(['sge/lib/class',], function(Class){

	var Engine = Class.extend({
		init: function(){
			this.interval = null;
			this.entities = {};
			this._ids =[];
			this._lastTick = 0;
			this._debug=0;
			this._debugTick = false;
		},

		run: function(fps) {
			if (fps==undefined){
				fps = 30.0;
			};
			this._lastTick = Date.now();
			this.interval = setInterval(this.tickCallback.bind(this), 1000.0 / fps);
		},

		stop: function(){
			clearInterval(this.interval);
			this.interval = null;
		},

		tickCallback: function(){
			/*
			this._debug--;
			if (this._debug<0){
				this._debugTick = true;
			}
			//*/
			var now = Date.now();
			var delta = now - this._lastTick;
			this._lastTick = now;
			this.tick(delta/1000);
			/*
			if (this._debugTick==true){
				this._debugTick = false;
				this._debug=30;
				console.log('Tick Length:', (Date.now() - now));
			}
			//*/
		}
	});
	return Engine
});

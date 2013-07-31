define(['sge'],function(sge){

	var StatsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.xp = 0; //data.xp==undefined ? 0 : data.xp;
			this.data.level = 0;
			this.data.alignment = data.alignment || 'evil';
			this.nextLevel = 5;
			this.levelUp();
		},
		addStat : function(stat, value){
			value = value || 1;
			this.set(stat, this.get(stat) + value);
		},
		subtractStat : function(stat, value){
			value = value || 1;
			this.set(stat, this.get(stat) - value);
		},
		levelUp: function(){
			this.set('level', 1, 'add');
			level = this.data.level;
			this.entity.set('health.maxLife', 7 + (33*level));
			this.entity.set('health.life', 7 + (33*level));
			this.nextLevel += (level * 10);
			this.entity.fireEvent('state.log','Level Up: ' + level);
		},
		_set_xp: function(xp, method){
			var xp = this.__set_value('xp', xp, method);
			if (xp>this.nextLevel){
				this.levelUp();
			}
		}
	})
	sge.Component.register('stats', StatsComponent);
    return StatsComponent;
})		

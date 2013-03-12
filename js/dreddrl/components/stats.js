define(['sge'],function(sge){

	var StatsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.speed = data.speed || 192;
			this.data.health = data.health || 10 ;
			this.data.maxHealth = data.heath || 10;
			this.data.alignment = data.alignment || 'evil';
		},
		addStat : function(stat, value){
			value = value || 1;
			this.set(stat, this.get(stat) + value);
		},
		subtractStat : function(stat, value){
			value = value || 1;
			this.set(stat, this.get(stat) - value);
		},
	})
	sge.Component.register('stats', StatsComponent);
    return StatsComponent;
})		
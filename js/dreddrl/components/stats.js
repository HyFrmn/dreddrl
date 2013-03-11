define(['sge'],function(sge){

	var StatsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.speed = data.speed || 192;
			this.data.health = data.health || 10 ;
			this.data.maxHealth = data.heath || 10;
			this.data.alignment = data.alignment || 'evil';
		},
		hit: function(){
			console.log('Hit');
		},
		kill: function(){
			this.entity.fireEvent('kill');
		},
		register: function(){
			this.entity.addListener('contact.tile', this.kill)
		}
	});
	sge.Component.register('stats', StatsComponent);
    return StatsComponent;
})		
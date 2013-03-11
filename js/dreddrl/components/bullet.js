define(['sge'],function(sge){

	var BulletComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.kill = this.kill.bind(this);
			this.hit = this.hit.bind(this);
		},
		hit: function(){
			console.log('Hit');
		},
		kill: function(){
			this.entity.fireEvent('kill');
		},
		register: function(){
			this.entity.addListener('contact.tile', this.kill)
		},
		tick: function(delta){
			console.log(this.entity.get('xform.vx') * delta, this.entity.get('xform.vy') * delta);
			this.entity.set('physics.width', Math.max(Math.abs(this.entity.get('xform.vx')) * delta, 2)*2);
			this.entity.set('physics.height', Math.max(Math.abs(this.entity.get('xform.vy')) * delta, 2)*2);
		}
	});
	sge.Component.register('bullet', BulletComponent);
    return BulletComponent;
})		
define(['sge', './bullet'],function(sge){

	var WeaponsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.fire = this.fire.bind(this);
		},
		fire: function(){
			var ammo = this.entity.get('inventory.ammo');
			if (ammo<=0){
				/*blink ammo red*/
				return;
			}
			this.entity.set('inventory.ammo', ammo-1);

			var speed = 1024;
			var vx = 0;
			var vy = 0;
			switch( this.entity.get('xform.dir')){
				case 'up':
					vy = -1;
					break;
				case 'down':
					vy = 1;
					break;
				case 'left':
					vx = -1;
					break;
				case 'right':
					vx = 1;
					break;
			}
			var bullet = new sge.Entity({
				xform: {
					tx: this.entity.get('xform.tx') + (vx * 24),
					ty: this.entity.get('xform.ty') + (vy * 24),
					vx: vx * speed,
					vy: vy * speed
				},
				physics: { width: (4 + Math.abs(vx*48)), height: (4+Math.abs(vy*48))},
				bullet:{},
				debug: {},
				health: {life: 1, alignment: this.entity.get('health.alignment'), visible: false}
			});
			this.state.addEntity(bullet);
		},
		register: function(state){
			this.state = state;
			this.entity.state.input.addListener('keydown:X', this.fire);
		},
		unregister: function(){
			this.entity.state.input.removeListener('keydown:X', this.fire);
			this.state = null;
		}
	});
	sge.Component.register('weapons', WeaponsComponent);
    return WeaponsComponent;
})
define(['sge', './config'], function(sge, config){
	var Weapon = sge.Class.extend({
		init: function(entity, options){
			options = options || {};
			this.entity = entity;
			this.state = entity.state;
			this._fireType = Weapon.FIRETYPES.PROJECTILE;
			this._ammoTypes = options.ammo || ['maground'];
			this._ammoIndex = 0;
			this._projectileType = this._ammoTypes[this._ammoIndex];
			this._cooldown = 0;
			this._rps = options.rps || 3;

		},
		fire: function(){
			if (this.canFire()){
				if (this.hasAmmo()){
					if (this.consumeAmmo()){
						this.fireProjectile()
					}
				}
			}
		},
		fireProjectile : function(){
			var vx = 0;
			var vy = 0;
			var speed = 1024;
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
			var tx = this.entity.get('xform.tx');
			var ty = this.entity.get('xform.ty');
			projectileData = sge.util.deepExtend({firedBy: this.entity}, Weapon.DATA.ammo[this._projectileType]);
			var bullet = this.entity.state.factory(null, {
				xform: {
					tx: tx,
					ty: ty,
					vx: vx * speed,
					vy: vy * speed,
                    container: '_entityContainer'
				},
				physics: { width: (4 + Math.abs(vx*20)), height: (4+Math.abs(vy*20)), type:2, fast:true},
				projectile: projectileData,
			});
			this.entity.state.addEntity(bullet);
			bullet.set('xform.v', vx * speed, vy * speed);
		},
		hasAmmo: function(){
			return true;
		},
		consumeAmmo: function(){
			var ammo = this.entity.get('inventory.ammo');
			var newammo = ammo - 1;
			if (newammo>=0){
				this.entity.set('inventory.ammo', newammo);
				return true;
			}
			return false;
		},
		switchAmmo : function(){
			this._ammoIndex++;
			if (this._ammoIndex>=this._ammoTypes.length){
				this._ammoIndex = 0;
			}
			this._projectileType = this._ammoTypes[this._ammoIndex];
			this.entity.fireEvent('state.info', 'Switched to ' + this._projectileType + ' ammo.');
		},
		canFire : function(){
			if (this._cooldown>0){
				return false;
			} else {
				this._cooldown = 1 / (this._rps);
				return true;
			}
		},
		tick : function(delta){
			if (this._cooldown>0){
				this._cooldown -= delta;
			}
		}

	});

	Weapon.FIRETYPES = {
		PROJECTILE : 0,
		MELEE : 1,
		INSTANT : 2
	};


	Weapon.DATA = null;
	Weapon.bootstrap = function(){
		sge.util.ajax(config.weaponDataUrl, function(rawText){
			Weapon.DATA = JSON.parse(rawText);
		});
	};

	Weapon.Factory = function(entity, weaponType){
		var weapon = new Weapon(entity, Weapon.DATA.weapons[weaponType]);
		return weapon;
	}

	return Weapon;
})
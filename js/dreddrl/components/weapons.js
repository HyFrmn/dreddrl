define(['sge', '../config', './bullet'],function(sge, config){
	var ProjectileComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.sourceEntity = data.sourceEntity;
			this.data.damage = data.damage || 0;
			this.data.damageType = data.damageType || "BALLISTIC";
			this.data.drawColor = data.drawColor || 'yellow';
		},
		register: function(state){
			this._super(state);
			this._killCallback = this.entity.addListener('contact.tile', this.kill.bind(this));
			this._contactCallback = this.entity.addListener('contact.start', this.onContact.bind(this))

			//DRAW CODE??? 
			this.scene = this.state.scene;
            this.container = new CAAT.ActorContainer().setLocation(12,12);
            var sizeX = 4;
            var sizeY = 24;
            if (Math.abs(this.entity.get('xform.vx')) > Math.abs(this.entity.get('xform.vy'))){
                sizeX = 24;
                sizeY = 4;
            }
            this.actor = new CAAT.Actor().setSize(sizeX,sizeY).setFillStyle(this.get('drawColor')).setLocation(0,0);
            this.container.addChild(this.actor);
            this.entity.get('xform.container').addChild(this.container);
		},
		deregister: function(state){
            this.entity.get('xform.container').removeChild(this.container);
            this._super(state);
        },
		kill : function(){
			this.entity.fireEvent('entity.kill');
		},
		onContact : function(entity){
			if (entity!=this.data.sourceEntity){
				damageProfile = {
					damage : this.get('damage'),
					damageType : this.get('damageType'),
				}
				entity.fireEvent('entity.takeDamage', damageProfile);
				this.kill();
			};
		},
		isEnemy: function(){

		}
	});
	sge.Component.register('projectile', ProjectileComponent);

	var Weapon = sge.Class.extend({
		init: function(entity){
			this.entity = entity;
			this.state = entity.state;
			this._fireType = Weapon.FIRETYPES.PROJECTILE;
			this._projectileType = 'stun';
		},
		fire: function(){
			if (this.hasAmmo()){
				this.consumeAmmo();
				this.fireProjectile()
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
			projectileData = sge.util.deepExtend({sourceEntity: this.entity}, Weapon.DATA.ammo[this._projectileType]);
			var bullet = new sge.Entity({
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

		},

	});

	Weapon.FIRETYPES = {
		PROJECTILE : 0,
		MELEE : 1,
		INSTANT : 2
	};


	Weapon.DATA = null;
	sge.util.ajax('/assets/items/weapons.json', function(rawText){
		Weapon.DATA = JSON.parse(rawText);
	});

	var WeaponsComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.cooldown = 0;
			this.data.rps = parseInt(data.rps || 3); //Round per second
			this.fire = this.fire.bind(this);
			this.entity.addListener('weapon.fire', this.fire.bind(this));
			this.entity.addListener('weapon.switch', this.switchWeapon.bind(this));
			this.activeWeapon = new Weapon(this.entity);
			this._weaponList = ['stun','maground'];
			this._weaponIndex = 0;
		},
		tick: function(delta){
			if (this.get('cooldown')>0){
				this.set('cooldown', -delta, 'add');
			}
		},
		fire: function(){
			this.activeWeapon.fire();
		},
		switchWeapon: function(){
			this._weaponIndex++;
			if (this._weaponIndex>=this._weaponList.length){
				this._weaponIndex=0;
			}
			this.activeWeapon._projectileType = this._weaponList[this._weaponIndex];
			this.entity.fireEvent('state.info', 'Loaded ' + this.activeWeapon._projectileType + ' ammo.');
		},
		register: function(state){
			this.state = state;
			
		},
		unregister: function(){
			this.state = null;
		}
	});
	sge.Component.register('weapons', WeaponsComponent);
    return WeaponsComponent;
})

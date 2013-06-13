define(['sge', './item', './config'], function(sge, Item, config){
	var Encounter = sge.Class.extend({
		init: function(system, options){
			this.system = system;
			this.block = system.level;
			this.state = system.state;
			this.factory = this.state.factory;
			this.status = 0;
			this.total = 1;
			this.targetEntity = null;
			this.entities = {};
			this.items = {};
			this.rooms = {};
			this.start(options);
		},
		isFinished: function(){
			return (this.status>=this.total);
		},
		start: function(){

		},
		finish: function(){
			this.system.complete(this);
		},
		tick: function(){
		},
		getPC : function(){
			return this.state.getEntityWithTag('pc');
		},
		update: function(status){
			if (this.isFinished()){
				this.finish();
			};
		},
		add : function(comp){
			var entity = comp.entity;
			entity.addListener('target.set', function(){
				this.targetEntity = entity;
			}.bind(this));
			entity.addListener('target.remove', function(){
				this.targetEntity = null;
			}.bind(this));
			return this;
		}
	});


	var SerialEncounter = Encounter.extend({
		start: function(options){
			var active = null;
			this.total = options.steps || 1;
			this.description = options.description || "";
			var roomNames = _.keys(options.rooms || {});
			var rooms = _.map(roomNames, function(name){
				var def = options.rooms[name];
				room = this.block.getRandomEncounterRoom();
				room._populated = true;
				if (def.locked){
					_.each(room.doors, function(door){
						door.set('door.locked', true);
					});
				}
				if (def.spawn){
					_.each(def.spawn, function(type){
						room.spawn(type);
					});
				}
				this.rooms[name] = room;
			}.bind(this))

			var itemNames = _.keys(options.items || {});
			var items = _.map(itemNames, function(name){
				var def = options.items[name];
				var item = Item.Factory(def.type, def);
				this.items[name] = item;
			}.bind(this))

			var entityNames = _.keys(options.entities || {});
			var entities = _.map(entityNames, function(name){
				var def = options.entities[name];
				def.meta = def.meta || {spawn: null};
				def.encounter = {encounter: this};
				var entity = null
				if (def.meta.use){
					//Entity
					entity = def.meta.use;;

					//Update entity;
					delete def.meta;
					var keys = Object.keys(def);
					keys.reverse();
					for (var j = keys.length - 1; j >= 0; j--) {
						var key = keys[j];
						var comp = entity.get(key);
						if (comp){
							_.each(def[key], function(value, path){
								comp.set(path, value);
							});
						} else {
							comp = sge.Component.Factory(key, entity, def[key]);
							entity.components[key] = comp;
							comp.register(entity.state);
						}
					};

				} else {
					var base = def.meta.inherit || 'citizen';
					
					spawnType = def.meta.spawn.policy || def.meta.spawn || 'room.random';
					spawnData = def.meta.spawn || {};
					
					subdata = spawnType.split('.');
					var handler = subdata.shift();
					this['_spawn_' + handler].apply(this, [spawnData, subdata, def]);
					
					//Update entity;
					delete def.meta;
					entity = this.factory(base, def);
					this.state.addEntity(entity);
				}
				entity.tags.push(name);
				this.entities[name] = entity;
				return entity;
			}.bind(this));
			if (active==null){
				active = entities[0];
			};
			this.targetEntity = active;
		},
		_spawn_random: function(spawnData, method, def){
			var radius = spawnData.radius || 64;
			var theta = Math.PI * 2 * sge.random.unit();
			var tx = this.entities[spawnData.target].get('xform.tx');
			var ty = this.entities[spawnData.target].get('xform.ty');
			def.xform = def.xform || {};
			def.xform.tx = tx + Math.sin(theta) * radius;
			def.xform.ty = ty + Math.sin(theta) * radius;
			return def
		},
		_spawn_room: function(spawnData, method, def){
			var room = this.block.getRandomEncounterRoom();
			if (method!='random'){
				room = this.rooms[method];
			}
			def.xform = def.xform || {};
			def.xform.tx = room.cx * 32;
			def.xform.ty = room.cy * 32;
		}
	})

	var serialData = {};
	

	var EncounterSystem = sge.Class.extend({
		init: function(state, level){
			this.state = state;
            this.level = level;
			this.encounters = [];
			this.active = null;
			this._index = 0;
			this.compassActor = new CAAT.ShapeActor().setShape(CAAT.ShapeActor.SHAPE_CIRCLE).setFillStyle('yellow').setSize(32,32);
			this.state.map.canopy.addChild(this.compassActor);
			//this.compassActor.setAlpha(1);
			//this.state.map.canopy.setZOrder(this.compassActor, 0);
		},
		create : function(klass, options){
			var encounter = new klass(this, options);
			this.encounters.push(encounter);
			if (!this.active){
				this.active = encounter;
			}
			return encounter;
		},
		createSerial: function(template, options){
			tmpl = sge.util.deepExtend({}, serialData[template]);
			options = options || {};
			var opts = sge.util.deepExtend(tmpl, options);
			return this.create(SerialEncounter, opts);
		},
		getTargetEntity : function(){
			var entity = null;
			if (this.active){
				entity = this.active.targetEntity;
			}
			return entity;
		},
		_compass_tick : function(delta){
            var entity = this.getTargetEntity();
            if (entity){
            	var pc = this.state.pc;
                coord = [entity.get('xform.tx'), entity.get('xform.ty')];
                var dx = coord[0] - pc.get('xform.tx');
                var dy = coord[1] - pc.get('xform.ty');
                var dist = Math.sqrt((dx*dx)+(dy*dy));
                var len = 640; //Math.min(dist, 640);
                var x1 = Math.round(pc.get('xform.tx'));
                var y1 = Math.round(pc.get('xform.ty')); 
                var x2 = Math.round(entity.get('xform.tx'));
                var y2 = Math.round(entity.get('xform.ty'));
                var top = Math.round(64-this.state._gamePlayContainer.y);
                var bottom = Math.round((this.state.game.renderer.height-64) - this.state._gamePlayContainer.y);
                var left = Math.round(64-this.state._gamePlayContainer.x);
                var right = Math.round((this.state.game.renderer.width-64) - this.state._gamePlayContainer.x);
                var coords = [[left,top,right,top],[left,bottom,right,bottom],[left,top,left,bottom],[right,top,right,bottom]];
                var intersection = false;
                //*
                for (var i = coords.length - 1; i >= 0; i--) {
                    var coord = coords[i];
                    if (this._debug_tick){
                        var x3 = coord[0];
                        var y3 = coord[1];
                        var x4 = coord[2];
                        var y4 = coord[3];
                        var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                        var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
                    }
                    intersection = sge.collision.lineIntersect(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
                    if (intersection){
                        break;
                    }
                }
                //*/ 
                if (intersection){
                    var tx = intersection[0];
                    var ty = intersection[1];
                    dx = tx - entity.get('xform.tx');
                    dy = ty - entity.get('xform.ty');
                    var maxDist = 1024;
                    var foo = Math.min(maxDist, Math.sqrt((dx*dx)+(dy*dy)));
                    var r = 6 + (24 * ((maxDist-foo)/maxDist));
                    this.compassActor.setSize(r,r);
                } else {
                    tx =  entity.get('xform.tx');
                    ty =  entity.get('xform.ty');
                }
                var view = {
                    top : top,
                    bottom : bottom,
                    left : left,
                    right : right
                }
                this.compassActor.setLocation(tx, ty);
            }
        },
		tick: function(){
			if (this.state.getEntitiesWithTag('pc').length<=0){
                    this.state.game.fsm.gameOver();
            }

            if (_.every(this.encounters, function(e){return e.isFinished()})){
                this.state.game.fsm.gameWin();
            }

            this._compass_tick();
		},
		complete: function(encounter){
			this._next = -1;
			this.switch();
		},
		next: function(){
			var activeEncounters = _.filter(this.encounters, function(e){return !e.isFinished()});
			this._index++;
			if (this._index>=activeEncounters.length){
				this._index=0;
			}
			return activeEncounters[this._index];
		},
		switch: function(){
			this.active = this.next();
			this.state.info(this.active.description);
		}
	})

	EncounterSystem.bootstrap = function(){
	sge.util.ajax(config.encounterDataUrl, function(rawText){
				data = JSON.parse(rawText);
				data.forEach(function(encounter){
					serialData[encounter.name] = encounter;
				})
	}.bind(this));
}

	return {
		Encounter : Encounter,
		EncounterSystem : EncounterSystem,
		SerialEncounter : SerialEncounter
	}
})

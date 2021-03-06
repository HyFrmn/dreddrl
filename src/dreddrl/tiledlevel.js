define([
    'sge',
    './level',
    './quest',
    './region',
    './room',
    './expr'
],
function(sge, Level, Quest, Region, Room, Expr){
	var TiledLoader = function(){

	}

	var TiledLevel = Level.extend({
		init: function(state, options){
			var levelName = options.level;
			var levelData = state.game.data.levels[levelName];
			this.width = levelData.width;
			this.height = levelData.height;
			this._super(state, options);
			var layerData = {};
			levelData.layers.forEach(function(layer){
				layerData[layer.name] = layer;
			});
			levelData.layers.forEach(function(layer){
				if (layer.type=='tilelayer'){
					var layerName = layer.name;
					var xTileCount = levelData.tilesets[0].imagewidth / levelData.tilesets[0].tilewidth;
					var yTileCount = levelData.tilesets[0].imageheight / levelData.tilesets[0].tileheight;
					for (var i = layer.data.length - 1; i >= 0; i--) {
						var tileIdx = layer.data[i]-1;
						if (layerName=='terrain'){
							this.map._tiles[i].passable = (tileIdx<0)
						} else {
							if (tileIdx>0){
								this.map._tiles[i].layers[layerName] = {
									srcX : tileIdx % xTileCount,
									srcY : Math.floor(tileIdx / xTileCount)
								}
							}
						}
					};
				}
			}.bind(this));
			
			layer = layerData.regions;
			regions = [];
			if (layer!==undefined){
				for (var q = layer.objects.length - 1; q >= 0; q--) {
					var region = layer.objects[q];
					var tx = region.x + 16;
					var ty = region.y - 16;
					var klass = Region
					if (region.type=='room'){
						console.log('ROOM!!!')
						klass = Room;
					} 
					regions.push(new klass(this.state, region.name, region.x, region.x+region.width,region.y, region.y+region.height));
				}
			}
			
			layer = layerData.dynamic
			if (layer){
				for (var q=0; q<=layer.objects.length-1;q++){
					var obj = layer.objects[q];
					var tileWidth = obj.width/32;
					var tileHeight = obj.height/32;

					var startX = (obj.x/32);
					var startY = (obj.y/32);
					var tiles = []
					for (var y_=0; y_<tileHeight; y_++){
						for (var x_=0; x_<tileWidth; x_++){
							//tiles.push(state.map.getTile(x_ + startX,y_ + startY).layer.dynamic)
						}
					}
					var e = this.state.createEntity('object',{ xform: {tx: obj.x + (obj.width/2), offsetX:0, ty: obj.y + (obj.height/2), offsetY: 0}, tilecache: { tiles: [startX, startY, tileWidth, tileHeight]}});
					this.state.addEntity(e);

				}
			}

			var layer = layerData['entities']
			if (layer){
				for (var i = layer.objects.length - 1; i >= 0; i--) {
					var obj = layer.objects[i];
					console.log(obj.name);
					var tx = obj.x + 16;
					var ty = obj.y - 16;
					if (obj.name=='pc'){
						this.startLocation = {tx: tx, ty: ty};
					} else {
						var eData = {};
						var decorators = []
						var keys = Object.keys(obj.properties);
						keys.forEach(function(key){
							if (key.indexOf(':')>=0){
								var cmd = key.match(/([a-z]+):/);
								if (cmd[1]=='on'){
									var serialEvt = key.slice(cmd.length+1);
									var parts = serialEvt.split('::');
									var eventName = parts.shift();
									var val = obj.properties[key];
									var callback = function(){
										var expr = new Expr(val);
										expr.addContext('self', e);
										expr.addContext('state', e.state);
										expr.addContext('level', this);
										expr.run();
									}.bind(this);
									var mods = [];
									for (var q=0; q<parts.length;q++){
										var mod = parts[q];
										var modData = mod.match(/([a-z]+)\(([a-z\.=]+)\)/);
										var modName = modData[1];
										var modArg  = modData[2];
										callback = function(cb){
											return function(e){
												if (e.name==modArg){
													return cb(e)
												}
											}
										}(callback)
										
									};
									var decorator = function(e){
										e.addListener(eventName, callback);
									}.bind(this)
									decorators.push(decorator);
								}
							} else {

								var subpaths = key.split('.');
								var pointer = eData;
								var val = obj.properties[key];
								var match = val.match(/\$\(([A-Za-z._0-9\:\-]+)\)/);
								if (match){
									var name = match[1];
									if (name.match(/region:/)){
										val = this.state.getRegion(name.match(/region:(.+)/)[1]);
									} else {
										val = this.state.getEntityWithTag(name);
									}
									console.log(name, val);
								}

								while (subpaths.length){
									var sp = subpaths.shift();
									if (pointer[sp]==undefined){
										pointer[sp]={}
									}
									if (subpaths.length==0){
										pointer[sp] = val;
									} else {
										pointer = pointer[sp];
									}
								}
							}
						}.bind(this));
						eData = sge.util.deepExtend(eData, {xform:  {tx: tx, ty: ty}});
						var e = this.state.createEntity(obj.type, eData);
						e.tags.push(obj.name);
						this.state.addEntity(e);
						
						console.log(obj.name, obj.type);
						for (var j = decorators.length - 1; j >= 0; j--) {
							var func = decorators[j];
							func(e)
						};

					}
				}
			}

			if (levelData.properties.quests){
				var questNames = levelData.properties.quests.split(' ');
				console.log(questNames)
				for (var q = questNames.length - 1; q >= 0; q--) {
					Quest.Load(this, questNames[q]);

				};
			}
			regions.forEach(function(r){r.update()});
		}
	})

	return TiledLevel;
});
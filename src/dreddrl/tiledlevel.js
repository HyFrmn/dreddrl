define([
    'sge',
    './factory',
    './level',
    './region',
    './room',
    './quest'
],
function(sge, Factory, Level, Region, MegaBlockRoom, Quest){
	var TiledLoader = function(){

	}

	var TiledLevel = Level.extend({
		init: function(state, options){
			var levelName = options.level;
			var levelData = state.game.data.levels[levelName];
			console.log(levelName, state.game.data)
			console.log(levelData.width, levelData.height);
			this.width = levelData.width;
			this.height = levelData.height;
			this._super(state, options);
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
				} else if (layer.type=='objectgroup') {
					for (var i = layer.objects.length - 1; i >= 0; i--) {
						var obj = layer.objects[i];
						var tx = obj.x + 16;
						var ty = obj.y - 16;
						if (obj.name=='pc'){
							this.startLocation = {tx: tx, ty: ty};
						} else {
							var e = this.state.createEntity(obj.type, {xform:  {tx: tx, ty: ty}});
							this.state.addEntity(e);
						}
					};
				}
			}.bind(this))

		}
	})

	return TiledLevel;
});
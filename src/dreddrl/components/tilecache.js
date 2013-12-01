define(['sge'], function(sge){
	var TileCache = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.tileData = data.tiles;
			console.log('Init Tile Cache')
		},
		register: function(state){
			this._super(state);
			console.log('Register: Tile Cache', this.tileData[0], this.tileData[1], this.tileData[2], this.tileData[3]);
			this.createTileCache(this.tileData[0], this.tileData[1], this.tileData[2], this.tileData[3]);
		},
		createTileCache: function(startX, startY, tileWidth, tileHeight){
			this.imageCache = new CAAT.ActorContainer();
			console.log('Start:', startX, startY, tileWidth, tileHeight);
			for (var y_=0; y_<tileHeight; y_++){
				for (var x_=0; x_<tileWidth; x_++){
					console.log('Tile:',x_ + startX,y_ + startY);
					
					data = this.state.map.getTile(x_ + startX,y_ + startY).layers.dynamic;
					var actor = new CAAT.Actor().setLocation(x_ * 32, y_ * 32).setSize(32,32);
					actor.setBackgroundImage(sge.Renderer.SPRITESHEETS['base_tiles']).setSpriteIndex(data.srcY*8+data.srcX);
					this.imageCache.addChild(actor);
				}
			}
			this.imageCache.setLocation(-tileWidth*16,-tileHeight*16);//, tileWidth*32, tileHeight*32);
			this.entity.get('xform.container').addChild(this.imageCache);
			this.entity.get('xform.container').setSize(tileWidth*32,tileHeight*32);
		},
	})
	sge.Component.register('tilecache', TileCache);
})
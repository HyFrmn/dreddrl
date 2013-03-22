define(['sge/lib/class', 'sge/spritesheet', 'sge/config'], function(Class, SpriteSheet, config){
	var Tile = Class.extend({
		init: function(x, y){
			this.x = x;
			this.y = y;
            this.passable = true;
            this.hidden = false;
			this.layers = {
				'layer0' : { srcX : 14, srcY: 8}
			};
			this.fade = 1;
			this.animate = false;
			this.fadeDelta = 0.1;
			this.metaData = {};
		},
		hide: function(){
			//this.fade=1
			if (this.fade!=1){
				this.fadeDelta = 0.1;
				this.animate = true;
			}
		},
		show: function(){
			//this.fade=0;
			if (this.fade!=0){
				this.fadeDelta = -0.1;
				this.animate = true;
			}
		},
		anim: function(){
			if (this.animate){
				this.fade = Math.round(100 * Math.max(Math.min(this.fade + this.fadeDelta, 1), 0)) / 100.0;
				if (this.fade<=0){
					if (this.x == 1 && this.y == 1){
						console.log('visible', this.fade);
					}
					this.animate = false;
					this.fade = 0;
				} else if (this.fade>=1){
					this.animate = false;
					this.fade = 1;
				}
			}
		}
	})

	var Map = Class.extend({
		init: function(width, height, options){
            if (options===undefined){
                options = {
                    src: 'assets/quest/img/2/tilesheet.png'
                }
            }
			this.width = width;
			this.height = height;
			this.tileSize = 32;
			this._tiles = [];
			this.layers = ['layer0','layer1','layer2'];
			this.tileset = new Image();
			this.tileSheet = null;
			this.defaultSheet = 'default';
			this.spriteSheets = {};
			if (typeof options.src == "string"){
				this.spriteSheets['default'] = new SpriteSheet(options.src, 32, 32)
			} else {
				for (var i = options.src.length - 1; i >= 0; i--) {
					var src = options.src[i];
					var subpath = src.split('/');
					var name = subpath[subpath.length-1].split('.')[0];
					this.spriteSheets[name] = new SpriteSheet(src, 32, 32);
				};
			}

            var total = this.width * this.height;
            var x = 0;
			var y = 0;
			for (var i=0; i<total; i++){
				var tile = new Tile(x, y);
                if ((x===0) || (x==this.width-1) || (y===0) || (y==this.height-1)){
                    tile.layers['layer0'] = {srcX: 3, srcY: 0};
                    tile.passable = false;
                }
				this._tiles.push(tile);
				x++;
				if (x>=this.width){
					x=0;
					y++;
				}
			}

			//this.tileset.onload =  this.loadCallback.bind(this);
			//this.tileset.src = options.src;
			//this.tileSheet = new SpriteSheet(this.tileset.src, 32, 32);
		},
		getIndex : function(x, y){
			var index = (y * this.width) + x;
			if (x > this.width-1 || x < 0){
				return null;
			}
			if (y > this.height-1 || y < 0){
				return null;
			}
			return index;
		},
		getTile : function(x, y){
			return this._tiles[this.getIndex(x, y)] || null;
		},
		getTiles :  function(coords){
			tiles =  _.map(coords, function(coord){
				return this.getTile(coord[0],coord[1]);
			}.bind(this));
			return tiles;
		},
		renderTiles : function(renderer, coords){
			var trackX = renderer.tx;
        	var trackY = renderer.ty;
        	renderer.tx = 0;
        	renderer.ty = 0;
        	var width = renderer.width;
        	var height = renderer.height;
        	renderer.width = 2048;
        	renderer.height = 2048;
        	var colorR = Math.round(Math.random() * 255);
        	var colorG = Math.round(Math.random() * 255);
        	var colorB = Math.round(Math.random() * 255);
			for (var i = coords.length - 1; i >= 0; i--) {
				var tile = coords[i];
				if (tile.fade===undefined){
					var x = coords[i][0];
					var y = coords[i][1];
					tile = this.getTile(x,y);
				}
				for (var j=0;j<this.layers.length;j++){
					if (tile.fade<1){
						var tx = (tile.x + 0.5) * this.tileSize;
						var ty = (tile.y + 0.5) * this.tileSize;
						var tileData = tile.layers[this.layers[j]];
						if (tileData){
							var layer = tileData.layer || "base"
							var spriteSheet = tileData.spritesheet || this.defaultSheet;
							renderer.drawSprite(layer, this.spriteSheets[spriteSheet], [tileData.srcX, tileData.srcY], tx, ty, [1,1], false, j*10);
						}
					}
				}
				console.log(tile.x, tile.y, tile.fade);
				if (!tile.fade){
					var style = 'rgba('+colorR+','+colorG+','+colorB+',0.1)';
					console.log(style);
					renderer.drawRect("canopy", tx-16, ty-16, this.tileSize, this.tileSize, {fillStyle: style, strokeStyle: 'none'}, 100000000);
				} else {
					renderer.drawRect("canopy", tx-16, ty-16, this.tileSize, this.tileSize, {fillStyle: 'none', strokeStyle: 'none'}, 100000000);
				}
			};
			renderer.cacheUpdate('canopy');
			renderer.cacheUpdate('base');
			
			renderer.width = width;
			renderer.height = height;
			renderer.tx = trackX;
        	renderer.ty = trackY;
		},
		render : function(renderer){
			//renderer.tx = 0;
			//renderer.ty = 0;
			var tmpW = renderer.width;
			var tmpH = renderer.height;
			//renderer.width = this.width * this.tileSize;
			//renderer.height = this.height * this.tileSize;
			for (var j=0;j<this.layers.length;j++){
				for (var i = this._tiles.length - 1; i >= 0; i--) {
					var tile = this._tiles[i];
					if (tile.fade<1){
						var tx = (tile.x + 0.5) * this.tileSize;
						var ty = (tile.y + 0.5) * this.tileSize;
						var tileData = tile.layers[this.layers[j]];
						if (tileData){
							var layer = tileData.layer || "base"
							var spriteSheet = tileData.spritesheet || this.defaultSheet;
							renderer.drawSprite(layer, this.spriteSheets[spriteSheet], [tileData.srcX, tileData.srcY], tx, ty, [1,1], false, j*10);
						}
					}
				};
			}
			for (var k = this._tiles.length - 1; k >= 0; k--) {
				var tile = this._tiles[k];
				var tx = (tile.x) * this.tileSize;
				var ty = (tile.y) * this.tileSize;
				tile.anim();
				renderer.drawRect("canopy", tx, ty, this.tileSize, this.tileSize, {fillStyle: 'rgba(0,32,16,'+tile.fade+')', strokeStyle: 'none'});
			}
            /*
			renderer.cache('base', this.width*this.tileSize, this.height*this.tileSize);
			renderer.cache('canopy', this.width*this.tileSize, this.height*this.tileSize);
			renderer.width = tmpW;
			renderer.height = tmpH;
            */
		},
		loadCallback : function(){

			
            if (this.onready){
                this.onready();
            }
		}
	});

	return Map;
});
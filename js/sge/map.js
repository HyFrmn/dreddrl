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
		render : function(renderer){
			var ctx = renderer.layers['base'].context;
			ctx.clearRect(0, 0, this.width * this.tileSize, this.height * this.tileSize)
			for (var j=0;j<this.layers.length;j++){
				for (var i = this._tiles.length - 1; i >= 0; i--) {
					var tile = this._tiles[i];
					if (tile.fade<1){
						ctx.save()
						var tx = (tile.x + 0.5) * this.tileSize;
						var ty = (tile.y + 0.5) * this.tileSize;
						var tileData = tile.layers[this.layers[j]];
						if (tileData){
							var layer = tileData.layer || "base"
							var spriteSheet = tileData.spritesheet || this.defaultSheet;
							renderer.drawSprite(layer, this.spriteSheets[spriteSheet], [tileData.srcX, tileData.srcY], tx, ty, [1,1], false, j*10);
						}
						ctx.restore();
					}
				};
			}
			for (var k = this._tiles.length - 1; k >= 0; k--) {
				var tile = this._tiles[k];
				var tx = (tile.x) * this.tileSize;
				var ty = (tile.y) * this.tileSize;
				tile.anim();
				ctx.save()
					renderer.drawRect("canopy", tx, ty, this.tileSize, this.tileSize, {fillStyle: 'rgba(0,32,16,'+tile.fade+')', strokeStyle: 'none'});
				ctx.restore()
				//}
			}
		},
		loadCallback : function(){

			
            if (this.onready){
                this.onready();
            }
		}
	});

	return Map;
});
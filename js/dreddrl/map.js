define(['sge/lib/class', 'sge/vendor/caat','sge/spritesheet', 'sge/config'], function(Class, CAAT, SpriteSheet, config){
	var Tile = Class.extend({
		init: function(x, y){
			this.x = x;
			this.y = y;
            this.passable = true;
            this.hidden = false;
            this.layers = {
				'layer0' : { srcX : 14, srcY: 8}
			};
            this.actor = new CAAT.Actor();
			this.data = {
				territory: 'neutral'
			};
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
            this.options = options;
            this.container = new CAAT.ActorContainer();
            this.container.setBounds(0,0,2048,2048)
			this.width = width;
			this.height = height;
			this.tileSize = 32;
			this._tiles = [];
			this.layers = ['layer0','layer1','layer2'];
			this.tileset = new Image();
			this.tileSheet = null;
			this.defaultSheet = 'default';
			this.spriteSheets = {};
		},

		setup: function(scene){
			/*
			var options = this.options
			if (typeof options.src == "string"){
				this.spriteSheets['default'] = new SpriteSheet(options.src, 32, 32)
			} else {
				for (var i = options.src.length - 1; i >= 0; i--) {
					var src = options.src[i];
					var subpath = src.split('/');
					var name = subpath[subpath.length-1].split('.')[0];
					var image = new Image();
					image.src = src;
					this.spriteSheets[name] = new CAAT.SpriteImage().initialize(src, image.width / 32, image.height / 32);
				};
			}
			*/
            var total = this.width * this.height;
            var x = 0;
			var y = 0;
			console.log(this.spriteSheets)
			for (var i=0; i<total; i++){
				var tile = new Tile(x, y);
           		this.container.addChild(tile.actor);
           		//tile.actor.setSize(60,60).setFillStyle('#00ff00');
           		//console.log(this.spriteSheets[tile.layers.layer0.spriteSheet)
           		tile.actor.setBackgroundImage(this.spriteSheets['future2']).setSpriteIndex( 0 )
           		tile.actor.setLocation(x*32+16,y*32+16);
				this._tiles.push(tile);
				x++;
				if (x>=this.width){
					x=0;
					y++;
				}
			}
			scene.addChild(this.container);
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
			/*
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
				if (!tile.fade){
					var style = 'rgba('+colorR+','+colorG+','+colorB+',0.1)';
					//renderer.drawRect("canopy", tx-16, ty-16, this.tileSize, this.tileSize, {fillStyle: style, strokeStyle: 'none'}, 100000000);
				} else {
					//renderer.drawRect("canopy", tx-16, ty-16, this.tileSize, this.tileSize, {fillStyle: 'none', strokeStyle: 'none'}, 100000000);
				}
			};
			//renderer.cacheUpdate('canopy');
			//enderer.cacheUpdate('base');
			
			renderer.width = width;
			renderer.height = height;
			renderer.tx = trackX;
        	renderer.ty = trackY;
        	*/
		},
		render : function(renderer){
			_.each(this._tiles, function(t){
				var frame = t.layers.layer0.srcY * 8 + t.layers.layer0.srcX;
				t.actor.setSpriteIndex(frame);
			});
			this.container.cacheAsBitmap();
		},
		loadCallback : function(){

			
            if (this.onready){
                this.onready();
            }
		}
	});

	return Map;
});
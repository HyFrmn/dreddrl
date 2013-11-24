define(['sge', './item', './weapon', './quest'], function(sge, Item, Weapon, Quest){
	var when = sge.vendor.when;

	function loadImage (src) {
		var deferred = when.defer(),
			img = document.createElement('img');
		img.onload = function () { 
			deferred.resolve(img); 
		};
		img.onerror = function () { 
			deferred.reject(new Error('Image not found: ' + src));
		};
		img.src = src;

		// Return only the promise, so that the caller cannot
		// resolve, reject, or otherwise muck with the original deferred.
		return deferred.promise;
	}

	var Loader = sge.Class.extend({
		init: function(game){
			this.game = game;
		},
		loadImage: function(url, data){
			var _loadImage = function(img){
				spriteHeight = 32;
				spriteWidth = 32;
				if (data.size){
					if (data.size[1]!==undefined){
						spriteWidth = data.size[0];
						spriteHeight = data.size[1]
					} else {
						spriteWidth = spriteHeight = data.size;
					}
				}
	            sge.Renderer.SPRITESHEETS[data.name] = new CAAT.SpriteImage().initialize(img, img.height / spriteHeight, img.width / spriteWidth);
			}
            return loadImage(url).then(_loadImage);
		},
		loadJSON: function(url){
			var deferred = new when.defer();
			sge.util.ajax(url, function(raw){
				data = JSON.parse(raw);
				deferred.resolve(data);
			})
			return deferred.promise;
		},
		loadLevel: function(name,data){
			if (this.game.data.levels == undefined){
				this.game.data.levels = {};
			}
			this.game.data.levels[name] = data
		},
		loadQuest: function(url){
			var deferred = new when.defer();
			sge.util.ajax(url, function(raw){
				Quest.Add(raw);
				deferred.resolve(data);
			})
			return deferred.promise;
		},
		parseConfig: function(config){
			var deferred = new when.defer();

			// srcs = array of image src urls

			// Array to hold deferred for each image being loaded
			var deferreds = [];

			config.charas.forEach(function(sprite){
				sprite = { name: sprite, size: 32}
				var url = '/content/sprites/' + sprite.name + ".png"
				deferreds.push(this.loadImage(url, sprite).then(this.updateProgress.bind(this)));
				var sprite_tint = { name: sprite.name + "_tint_red", size: 32}
				url = '/content/sprites/' + sprite_tint.name + ".png"
				deferreds.push(this.loadImage(url, sprite_tint).then(this.updateProgress.bind(this)));
			}.bind(this));

			

			config.sprites.forEach(function(sprite){
				if (sprite.name == undefined){
					sprite = { name: sprite, size: 32}
				}
				var url = '/content/sprites/' + sprite.name + ".png"
				deferreds.push(this.loadImage(url, sprite).then(this.updateProgress.bind(this)));
			}.bind(this))



			config.tiles.forEach(function(sprite){
				sprite = { name: sprite, size: 32}
				var url = '/content/tiles/' + sprite.name + ".png"
				deferreds.push(this.loadImage(url, sprite).then(this.updateProgress.bind(this)));
			}.bind(this))


			config.quests.forEach(function(quest){
				var url = '/content/quests/' + quest + '.js';
				deferreds.push(this.loadQuest(url).then(this.updateProgress.bind(this)));
			}.bind(this));

			config.levels.forEach(function(level){
				var url = '/content/levels/' + level + '.json';
				deferreds.push(this.loadJSON(url).then(function(data){this.loadLevel(level, data)}.bind(this)).then(this.updateProgress.bind(this)));
			}.bind(this));

			deferreds.push(this.loadJSON("/content/items/standard.json").then(Item.bootstrap).then(this.updateProgress.bind(this)));
			
			deferreds.push(this.loadJSON("/content/weapons/standard.json").then(Weapon.bootstrap).then(this.updateProgress.bind(this)));

			this._count = 0;
			this._countTotal = deferreds.length;
			return when.all(deferreds);
		},

		loadAssets: function(url){
			return this.loadJSON(url).then(this.parseConfig.bind(this));
		},

		updateProgress: function(){
			this._count++;
			this.game._states.loading.updateProgress((this._count/this._countTotal));
		}
	});

	return Loader;
})
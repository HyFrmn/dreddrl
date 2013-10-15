define(['sge', './item', './weapon'], function(sge, Item, Weapon){
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
		loadImage: function(url){
			var _loadImage = function(img){
				var subpath = img.src.split('/');
	            var name = subpath[subpath.length-1].split('.')[0];
	            var spriteSize = 32;
	            if (name.match(/icons/)){
	                spriteSize = 24;
	            }
	            sge.Renderer.SPRITESHEETS[name] = new CAAT.SpriteImage().initialize(img, img.height / spriteSize, img.width / spriteSize);
	           
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
		parseConfig: function(config){
			var deferred = new when.defer();

			// srcs = array of image src urls

			// Array to hold deferred for each image being loaded
			var deferreds = [];

			config.charas.forEach(function(sprite){
				var url = '/content/sprites/' + sprite + ".png"
				deferreds.push(this.loadImage(url).then(this.updateProgress.bind(this)));
				url = '/content/sprites/' + sprite + "_tint_red.png"
				deferreds.push(this.loadImage(url).then(this.updateProgress.bind(this)));
			}.bind(this));

			

			config.sprites.forEach(function(sprite){
				var url = '/content/sprites/' + sprite + ".png"
				deferreds.push(this.loadImage(url).then(this.updateProgress.bind(this)));
			}.bind(this))



			config.tiles.forEach(function(sprite){
				var url = '/content/tiles/' + sprite + ".png"
				deferreds.push(this.loadImage(url).then(this.updateProgress.bind(this)));
			}.bind(this))



			deferreds.push(this.loadJSON("/content/items/standard.json").then(Item.bootstrap).then(this.updateProgress.bind(this)));
			
			deferreds.push(this.loadJSON("/content/weapons/standard.json").then(Weapon.bootstrap).then(this.updateProgress.bind(this)));
			
			console.log('Loading', deferreds.length)

			this._count = 0;
			this._countTotal = deferreds.length;
			return when.all(deferreds);
		},

		loadAssets: function(url){
			return this.loadJSON(url).then(this.parseConfig.bind(this));
		},

		updateProgress: function(){
			this._count++;
			console.log('Loaded:', 100*(this._count/this._countTotal) + '%');
		}
	});

	return Loader;
})
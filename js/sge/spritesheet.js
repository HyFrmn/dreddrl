define(function(){

	var SpriteSheet = function(image, spriteWidth, spriteHeight){
		if (spriteHeight ===undefined){
			spriteHeight  = spriteWidth;

		}
		this.ready = false;
		this.spriteWidth = spriteWidth;
		this.spriteHeight = spriteHeight;
		this.offsetX = this.spriteWidth / -2;
		this.offsetY = this.spriteHeight / -2;

		if (SpriteSheet.SpriteSheetImages[image]===undefined){
			this.image = new Image();
			this.buffer = this.image;
			this.image.onload = this.onLoadImage.bind(this);
			this.image.src = image;
			SpriteSheet.SpriteSheetImages[image]=this.image;
		} else {
			this.image = SpriteSheet.SpriteSheetImages[image];
			this.buffer = this.image;
			this.onLoadImage();
		}

	};

	SpriteSheet.SpriteSheetImages = {};

	SpriteSheet.prototype.onLoadImage = function(){
		this.imageWidth = this.image.width;
		this.imageHeight = this.image.height;
		this.horzSprites = this.imageWidth / this.spriteWidth;
		this.vertSprites = this.imageHeight / this.spriteHeight;
		this._image_tint = document.createElement('canvas');
        this._image_tint.width = this.image.width;
        this._image_tint.height = this.image.height;
        
        
        this._image_buffer = document.createElement('canvas');
        this._image_buffer.width = this.image.width;
        this._image_buffer.height = this.image.height;

        this.buffer = this.image;

		this.ready = true;
	};

	SpriteSheet.prototype.getSrcRect = function(sprite){
		var x = null;
		var y = null;
		if (sprite[0] != undefined){
			x = sprite[0];
			y = sprite[1];
		} else {
		    x = sprite % this.horzSprites;
		    y = Math.floor(sprite / this.horzSprites);
		}
		var srcX = x * this.spriteWidth;
		var srcY = y * this.spriteHeight;
		return [srcX, srcY, this.spriteWidth, this.spriteHeight];
	}

	SpriteSheet.prototype.tint = function(color){
		if (color===undefined){
			this.buffer = this.image;
		} else {
			ctx = this._image_tint.getContext('2d');
	        
	        ctx.fillStyle = color;
	        ctx.fillRect(0,0,this._image_tint.width, this._image_tint.height);
	        ctx.globalCompositeOperation = "destination-atop";
	        ctx.drawImage(this.image, 0, 0);
	        
	        ctx = this._image_buffer.getContext('2d');
	        ctx.drawImage(this.image, 0, 0);
	        if (this.tint_alpha > 0){
	            ctx.globalAlpha = this.tint_alpha;
	            ctx.drawImage(this._image_tint, 0, 0);
	            ctx.globalAlpha = 1;
	        }

	        this.buffer = this._image_tint;
	    }
	}

	return SpriteSheet;
});

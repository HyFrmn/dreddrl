define(function(require){
    var $ = require('jquery')
    var Vector2D = require('sge/lib/vector');

    var Renderer = function(container){
        this.container = $(container);
        this.mirror = true;
        this.width = this.container.width();
        this.height = this.container.height();
        this.layers = {};
        this.tx = 0;
        this.ty = 0;

        this._clearList = {};
        this._clearListNew = {};
        this._drawList = {};
        this._layers = [];
    };

    Renderer.prototype.track = function(entity, options){
        options = {
            padding: 128,
            speedScale: 1
        }
        var width = this.width;
        var height = this.height;
        var screenX = entity.get('xform.tx') - this.tx;
        var screenY = entity.get('xform.ty') - this.ty;
        if (screenX < 300){
            this.tx += options.speedScale * (screenX - 300);
        }
        if (screenX > width-300){
            this.tx += options.speedScale * (screenX - (width - 300));
        }
        if (screenY < options.padding){
            this.ty += options.speedScale * (screenY - options.padding);
        }
        if (screenY > height-options.padding){
            this.ty += options.speedScale * (screenY - (height - options.padding));
        }

    }

    Renderer.prototype.draw = function(layer, func){
        if (this._drawList[layer]===undefined){
            this._drawList[layer] = [];
        }
        this._drawList[layer].push(func);
    }

    Renderer.prototype.clear = function(layer, x, y, width, height){
        if (this._clearListNew[layer]==undefined){
            this._clearListNew[layer] = [[x, y, width, height],];
        } else {
            this._clearListNew[layer].push([x, y, width, height]);
        }
    }

    Renderer.prototype.render = function(layer){
        if (layer===undefined){
            var layers = this._layers;
            layers.reverse();
            for (var i = layers.length - 1; i >= 0; i--) {
                this.render(layers[i])
            }
        } else {
            if (this._clearList[layer]!==undefined){
                for (var i = this._clearList[layer].length - 1; i >= 0; i--) {
                    var clearRect = this._clearList[layer][i];
                    this.layers[layer].context.clearRect(clearRect[0],clearRect[1],clearRect[2],clearRect[3]);
                };
            }
            this._clearList[layer] = this._clearListNew[layer];
            this._clearListNew[layer] = undefined;
            var drawList = this._drawList[layer];
            if (drawList===undefined){
                return;
            }
            drawList.reverse();
            for (var j = drawList.length - 1; j >= 0; j--) {
                var func = drawList[j];
                func();
            };
            this._drawList[layer]=undefined;
        }
    }

    Renderer.prototype.createLayer = function(name) {
        if (this._layers.indexOf(name)>=0){
            this.layers[name].context.clearRect(0, 0, this.width, this.height);
        } else {
            this._layers.push(name);
            var id = "RPGEDITOR_RENDERER_LAYER_" + name;
            var canvasElem = $('<canvas id=' + id +'></canvas>');
            canvasElem.attr({width: this.width, height: this.height});
            this.container.append(canvasElem);
            var context = canvasElem[0].getContext('2d');
            //context.scale(0.5,0.5);
            this.layers[name] = { canvas : canvasElem,
                                    visible : true,
                                    context : context };
        }
                            
    };

    Renderer.prototype.drawRect = function(layer, x, y, width, height, style){
        var destRect = [
            Math.round(x - this.tx),
            Math.round(y - this.ty),
            Math.round(width),
            Math.round(height)
        ];
        if ((destRect[0]>this.width) || (destRect[1]>this.height)|| (destRect[2]+destRect[0]<0) || (destRect[1]+destRect[3]<0)){
            return;
        }
        var ctx = this.layers[layer].context;
        this.clear(layer, destRect[0]-8,destRect[1]-8,destRect[2]+16,destRect[3]+16)
        this.draw(layer, function(){
            ctx.save();
            var keys = Object.keys(style);
            for (var j = keys.length - 1; j >= 0; j--) {
                var key = keys[j];
                ctx[key] = style[key];
            };
            ctx.beginPath()
            ctx.rect(destRect[0],destRect[1],destRect[2],destRect[3]);
            ctx.fillRect(destRect[0],destRect[1],destRect[2],destRect[3]);
            ctx.stroke();
            ctx.restore();
        });
    }

    Renderer.prototype.drawSprite = function(layer, spriteSheet, sprite, x, y, scale, clear){
        if (scale===undefined){
            scale=[1,1];
        }
        var srcRect = spriteSheet.getSrcRect(sprite);

        var tx = Math.round(x + (spriteSheet.offsetX * scale[0]) - this.tx);
        var ty = Math.round(y + (spriteSheet.offsetY * scale[1]) - this.ty);

        var clearX = Math.round(x + (spriteSheet.offsetX * Math.abs(scale[0])) - this.tx);
        var clearY = Math.round(y + (spriteSheet.offsetY * Math.abs(scale[1])) - this.ty);

        var destRect = [
            tx,
            ty,
            Math.round(srcRect[2] * Math.abs(scale[0])),
            Math.round(srcRect[3] * Math.abs(scale[1])),
        ]

        if ((destRect[0]>this.width) || (destRect[1]>this.height) || (destRect[2]+destRect[0]<0) || (destRect[1]+destRect[3]<0)){
            return;
        }

        var ctx = this.layers[layer].context;
        if (clear!==false){
            this.clear(layer, clearX, clearY,destRect[2],destRect[3])
        }

        this.draw(layer, function(){
            ctx.save();
            ctx.translate(tx, ty);
            ctx.scale(scale[0],scale[1]);
            /*
            if (spriteSheet.buffer){
                console.log('Missing', spriteSheet, spriteSheet.buffer)
                return;
            }
            */
            ctx.drawImage(
                spriteSheet.image,
                srcRect[0],
                srcRect[1],
                srcRect[2],
                srcRect[3],
                0,
                0,
                destRect[2],
                destRect[3]);
            ctx.restore();
        });
    }

    return Renderer;
})
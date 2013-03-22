define(['jquery'], function($){
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
        this.tx = Math.round(this.tx);
        this.ty = Math.round(this.ty);

    }

    Renderer.prototype.draw = function(layer, func, priority){
        priority = priority || 0;
        if (this._drawList[layer]===undefined){
            this._drawList[layer] = [];
        }
        this._drawList[layer].push({func: func, priority: priority*1000});
    }

    Renderer.prototype.clear = function(layer, x, y, width, height){
        if (this._clearListNew[layer]==undefined){
            this._clearListNew[layer] = [[x, y, width, height],];
        } else {
            this._clearListNew[layer].push([x, y, width, height]);
        }
    }

    Renderer.prototype.cache = function(layerName, width, height){
        var layer = this.layers[layerName];
        layer.cacheCanvas = $('<canvas/>').attr({width: width, height: height})[0];
        layer.cacheContext = layer.cacheCanvas.getContext('2d');
        layer.cacheContext.setTransform(1,0,0,1,0,0);
        var tmpW = this.width;
        var tmpH = this.height;
        this.width = width;
        this.height = height;
        var drawList = this._drawList[layerName];
        if (drawList===undefined){
            return;
        }
        drawList.sort(function(a,b){return b.priority - a.priority});
        //drawList.reverse();
        for (var j = drawList.length - 1; j >= 0; j--) {
            var func = drawList[j].func;
            func(layer.cacheContext);
        };
        this.height = tmpH;
        this.width = tmpW;
        this._drawList[layerName]=undefined;
        $(layer.cacheCanvas).css({display: 'none'});
        $('body').append(layer.cacheCanvas)
    }

     Renderer.prototype.cacheUpdate = function(layerName){
        var layer = this.layers[layerName];
        if (!layer.cacheCanvas){
            console.log('Missing Canvas:', layerName);
            return;
        }
        var drawList = this._drawList[layerName];
        if (drawList===undefined){
            console.log('Missing Draw List:', layerName);
            return;
        } else {
            console.log(drawList);
        }
        var trackX = this.tx;
        var trackY = this.ty;
        this.tx = 0;
        this.ty = 0;
        drawList.sort(function(a,b){return b.priority - a.priority});
        //drawList.reverse();
        if (layerName=='canopy'){
           //layer.cacheContext.clearRect(0,0,this.width,this.height);
        }
        for (var j = drawList.length - 1; j >= 0; j--) {
            var func = drawList[j].func;
            func(layer.cacheContext);
        };
        this._drawList[layerName]=undefined;
        this.tx = trackX;
        this.ty = trackY;
     }

    Renderer.prototype.render = function(layerName){
        if (layerName===undefined){
            var layers = this._layers;
            layers.reverse();
            for (var i = layers.length - 1; i >= 0; i--) {
                this.render(layers[i])
            }
        } else {
            var layer = this.layers[layerName];
            if (layer.cacheCanvas){
                layer.context.save()
                layer.context.setTransform(1,0,0,1,0,0);
                layer.context.clearRect(0,0,this.width, this.height);
                var tx = Math.max(0,this.tx);
                var offsetx = Math.min(0,this.tx);
                var height = Math.min(layer.cacheCanvas.height-this.ty,this.height);
                var ty = Math.max(0,this.ty);
                var offsety = Math.min(0,this.ty);
                var width = Math.min(layer.cacheCanvas.width-this.tx,this.width);
                layer.context.drawImage(layer.cacheCanvas, tx, ty, width-offsetx, height-offsety, -offsetx, -offsety, width-offsetx, height-offsety);
                layer.context.restore();
            } else {
                if (this._clearList[layerName]!==undefined){
                    for (var i = this._clearList[layerName].length - 1; i >= 0; i--) {
                        var clearRect = this._clearList[layerName][i];
                        this.layers[layerName].context.clearRect(clearRect[0],clearRect[1],clearRect[2],clearRect[3]);
                    };
                }
                this._clearList[layerName] = this._clearListNew[layerName];
                this._clearListNew[layerName] = undefined;
                var drawList = this._drawList[layerName];
                if (drawList===undefined){
                    return;
                }
                drawList.sort(function(a,b){return b.priority - a.priority});
                for (var j = drawList.length - 1; j >= 0; j--) {
                    var func = drawList[j].func;
                    func(layer.context);
                };
                this._drawList[layerName]=undefined;
            }
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

    Renderer.prototype.drawRect = function(layer, x, y, width, height, style, priority){
        var destRect = [
            Math.round(x - this.tx),
            Math.round(y - this.ty),
            Math.round(width),
            Math.round(height)
        ];
        if ((destRect[0]>this.width) || (destRect[1]>this.height)|| (destRect[2]+destRect[0]<0) || (destRect[1]+destRect[3]<0)){
            return;
        }
        //var ctx = this.layers[layer].context;
        priority = priority || 0;
        this.clear(layer, destRect[0]-4,destRect[1]-4,destRect[2]+8,destRect[3]+8)
        this.draw(layer, function(ctx){
            ctx.save();
            var keys = Object.keys(style);
            for (var j = keys.length - 1; j >= 0; j--) {
                var key = keys[j];
                ctx[key] = style[key];
            };
            ctx.beginPath()
            ctx.clearRect(destRect[0],destRect[1],destRect[2],destRect[3]);
            ctx.rect(destRect[0],destRect[1],destRect[2],destRect[3]);
            ctx.fillRect(destRect[0],destRect[1],destRect[2],destRect[3]);
            ctx.stroke();
            ctx.restore();
        }, priority + (y+x));
    }

    Renderer.prototype.drawSprite = function(layer, spriteSheet, sprite, x, y, scale, clear, priority){
        if (scale===undefined){
            scale=[1,1];
        }
        var srcRect = spriteSheet.getSrcRect(sprite);

        priority = priority || 0;

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

        //var ctx = this.layers[layer].context;
        if (clear!==false){
            this.clear(layer, clearX, clearY,destRect[2],destRect[3])
        }

        this.draw(layer, function(ctx){
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
                spriteSheet.buffer,
                srcRect[0],
                srcRect[1],
                srcRect[2],
                srcRect[3],
                0,
                0,
                destRect[2],
                destRect[3]);
            ctx.restore();
        }, priority + (y+x));
    }

    return Renderer;
})
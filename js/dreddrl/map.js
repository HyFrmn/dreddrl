define(['sge/lib/class', 'sge/vendor/caat','sge/renderer', 'sge/config'], function(Class, CAAT, Renderer, config){
    var Tile = Class.extend({
        init: function(x, y){
            this.x = x;
            this.y = y;
            this.passable = true;
            this.hidden = false;
            this.layers = {
                'layer0' : { srcX : 14, srcY: 8},
            };
            this.actors = {

            };
            this.data = {
                territory: 'neutral'
            }
            this.entities = [];


        },
        getRect : function(){
            var rect = {
                left : (this.x*32)-1,
                right : (this.x*32)+32,
                top : (this.y*32)-1,
                bottom : (this.y*32)+32,
            }
            return rect;
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
        },
        update: function(){
            if (this.fade<1){
                visible = true;
            } else {
                visible = false;
            }
            _.each(this.entities, function(e){
                e.get('xform.container').setVisible(visible)
            })
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
            this.width = width;
            this.height = height;
            this.tileSize = 32;
            this.container = new CAAT.ActorContainer();
            this.container.setBounds(0,0,width*32+16,height*32+16);
            this.dynamicContainer = new CAAT.ActorContainer();
            this.dynamicContainer.setBounds(0,0,width*32+16,height*32+16);
            this._tiles = [];
            this.layers = ['layer0','layer1'];
            this.layerContainers = {};
            _.each(this.layers, function(layerName){
                this.layerContainers[layerName] = new CAAT.ActorContainer().setBounds(0,0,width*32,height*32);;
                this.container.addChild(this.layerContainers[layerName]);
            }.bind(this));
            this.tileset = new Image();
            this.tileSheet = null;
            this.defaultSheet = 'default';

            var total = this.width * this.height;
            var x = 0;
            var y = 0;
            for (var i=0; i<total; i++){
                var tile = new Tile(x, y);
                _.each(this.layers, function(layerName){
                    tile.actors[layerName] = new CAAT.Actor().setLocation(x*32+16,y*32+16).setFillStyle('#FF0000').setSize(30,30);
                    tile.actors[layerName].setBackgroundImage(Renderer.SPRITESHEETS['future2']).setSpriteIndex( 15 )//.setLocation(x*32+16,y*32+16);
                    //this.container.addChild(tile.actors[layerName]);
                    this.layerContainers[layerName].addChild(tile.actors[layerName]);
                }.bind(this));
                this._tiles.push(tile);
                x++;
                if (x>=this.width){
                    x=0;
                    y++;
                }
            }
        },

        setup: function(scene){
            scene.addChild(this.container);
            scene.addChild(this.dynamicContainer);
            this.scene = scene;
            //this.render();
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
        renderTile : function(t){
            _.each(this.layers, function(layerName){
                if (t.layers[layerName]){
                    var frame = t.layers[layerName].srcY * 8 + t.layers[layerName].srcX;
                    var spriteSheet= t.layers[layerName].spriteSheet || this.defaultSheet;
                    t.actors[layerName].setBackgroundImage(Renderer.SPRITESHEETS[spriteSheet]).setSpriteIndex(frame);
                } else {
                    t.actors[layerName].setVisible(false);
                }
            }.bind(this));
        },
        renderTiles : function(coords){
            _.each(coords, function(tile){
                if (tile.layers===undefined){
                    tile = this.getTile(tile[0],tile[1]);
                }e
                this.renderTile(tile);
            }.bind(this));
        },
        render : function(renderer){
            this.container.stopCacheAsBitmap();
            _.each(this._tiles, function(t){
                this.renderTile(t);
            }.bind(this));
            this.container.cacheAsBitmap(0,CAAT.Foundation.Actor.CACHE_DEEP);
        },
        refreshCache: function(){
            this.container.stopCacheAsBitmap();
            var tx = this.scene.x;
            var ty = this.scene.y;
            this.scene.setLocation(0,0);
            this.container.cacheAsBitmap(0,CAAT.Foundation.Actor.CACHE_DEEP);
            this.scene.setLocation(tx,ty);
        },
        loadCallback : function(){

            
            if (this.onready){
                this.onready();
            }
        }
    });

    return Map;
});

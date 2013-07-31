define([
    'sge/vendor/underscore',
    'sge/lib/class',
    'sge/lib/vector'
],
function(_, Class, Vector2D){
    var ShadowCaster = Class.extend({
        init: function(map){
            this._enabled = true;
            this.mult = [
                    [1,  0,  0, -1, -1,  0,  0,  1],
                    [0,  1, -1,  0,  0, -1,  1,  0],
                    [0,  1,  1,  0,  0, -1, -1,  0],
                    [1,  0,  0,  1, -1,  0,  0, -1]
                ];
            this.map = map;
            this.light = [];
            this.enable();
        },
        toggle : function(){
            if (this._enabled==true){
                this.disable()
            } else {
                this.enable();
            }
        },
        enable : function(){
            this._enabled = true;
            _.each(this.map._tiles, function(tile){
                tile.fade = 1;
            }.bind(this));
        },
        disable : function(){
            this._enabled = false;
            _.each(this.map._tiles, function(tile){
                tile.fade = 0;
            }.bind(this));
        },
        tick: function(tx, ty){
            if (!this._enabled){
                return;
            }
            this.light = [];
            _.each(this.map._tiles, function(){
                this.light.push(false);
            }.bind(this));

            var tileX = Math.floor(tx / this.map.tileSize);
            var tileY = Math.floor(ty / this.map.tileSize);
            this.light[this.map.getIndex(tileX, tileY)] = true;
            var radius = 24;

            for (var oct=0;oct<8;oct++){
                this.cast_light(tileX, tileY, 1, 1.0, 0.0, radius,
                                 this.mult[0][oct], this.mult[1][oct],
                                 this.mult[2][oct], this.mult[3][oct], 0)
            }

            _.each(this.map._tiles, function(tile){
                var isLit = this.light[this.map.getIndex(tile.x, tile.y)];
                if (isLit){
                    tile.show();
                } else {
                    tile.hide();
                }
            }.bind(this));
        },

        isBlocked : function(x, y){
            return (x < 0 || y < 0 || x>=this.map.width || y>=this.map.height || !this.map.getTile(x,y).passable)
        },

        lit : function(x, y){
            return this.light[this.map.getIndex(x, y)]
        },

        set_lit : function(x, y){
            if (x>0 && x<this.map.width && y>0 && y<this.map.height){
                this.light[this.map.getIndex(x,y)] = true;
            }
        },

        cast_light : function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id){
            if (start < end){
                return
            }
            var radius_squared = radius*radius
            for (var j=row;j<=radius;j++){
                var dx = -j-1;
                var dy = -j;
                var blocked = false;
                while (dx <= 0){
                    dx += 1
                    // Translate the dx, dy coordinates into map coordinates:
                    var X = cx + dx * xx + dy * xy;
                    var Y = cy + dx * yx + dy * yy;
                    // l_slope and r_slope store the slopes of the left and right
                    // extremities of the square we're considering:
                    var l_slope = (dx-0.5)/(dy+0.5);
                    var r_slope = (dx+0.5)/(dy-0.5);
                    if (start < r_slope){
                        continue
                    } else if (end > l_slope){
                        break
                    } else {
                        /// Our light beam is touching this square; light it:
                        if (dx*dx + dy*dy < radius_squared){
                            this.set_lit(X, Y);
                        }
                        if (blocked){
                            // we're scanning a row of blocked squares:
                            if (this.isBlocked(X, Y)){
                                new_start = r_slope;
                                continue
                            } else {
                                blocked = false;
                                start = new_start;
                            }
                        } else {
                            if (this.isBlocked(X, Y) && j < radius){
                                // This is a blocking square, start a child scan:
                                blocked = true;
                                this.cast_light(cx, cy, j+1, start, l_slope,
                                                 radius, xx, xy, yx, yy, id+1);
                                new_start = r_slope;
                            }
                        }
                    }
                }
                // Row is scanned; do next row unless last square was blocked:
                if (blocked){
                    break
                }
            }
        }
    });

    return ShadowCaster
});

define(['sge', './map'], function(sge, Map){

    var FLOORTILE =  { srcX : 0, srcY: 2};
    var FLOORTILE2 =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 1, srcY: 3, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 2, srcY: 4}
    var DOOROPENTILE2 = { srcX : 2, srcY: 5}
    var DOORCLOSEDTILE1 = { srcX : 1, srcY: 4}
    var DOORCLOSEDTILE2 = { srcX : 1, srcY: 5}
    
	var Level = sge.Class.extend({
        init: function(state, options){
            this._entities = [];
            this.state = state;

            this.options = _.extend({
                padding: 3,
                width: 12,
                height: 6,
            }, options);



            if (this.width==undefined){
                this.width = this.options.width + 2;
                this.height = this.options.height + 6;
            }
            
            this.startLocation = {
                tx: (this.width*16),
                ty: (this.height*16)
            }

            this.map = state.map = new Map(this.width,this.height,{src: ['assets/tiles/future1.png', 'assets/tiles/future2.png','assets/tiles/future3.png','assets/tiles/future4.png']});

            this.map.defaultSheet = 'base_tiles';

             _.each(this.map._tiles, function(t){
                t._mask=false;
                t.layers = {
                    'layerBase' : FLOORTILE
                }
                t.fade = 0;
            }.bind(this));

            this.buildBorders();

        },
        setup: function(){
            this.map.setup(this.state._entityContainer);
        },
        
        tick: function(){

        },

        buildBorders: function(){
            // Build level borders.
            this.buildWall(0,1,this.map.width,true);
            for (var y=0;y<this.map.height;y++){
                var tile = this.map.getTile(0, y);
                tile.layers = {
                    'layer0' : CEILTILE
                }
                tile.passable = false;
                tile.transparent = false;
                tile = this.map.getTile(this.map.width-1, y);
                tile.layers = {
                    'layer0' : CEILTILE
                }
                tile.passable = false;
                tile.transparent = false;
            }
            this.buildWall(0,this.map.height-2,this.map.width, true);
        },

        buildWall: function(sx, sy, length, ceil){
            for (var x=0;x<length;x++){
                var tile = this.map.getTile(x+sx, sy);
                tile.layers = {
                    'layer0' : { srcX : 2, srcY: 1}
                }
                tile.passable = false;
                tile = this.map.getTile(x+sx, sy+1);
                tile.layers = {
                    'layer0' : { srcX : 2, srcY: 2}
                }
                tile.transparent = false;
                tile.passable = false;
                if (ceil){
                   tile = this.map.getTile(x+sx, sy-1);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false; 
                }
            }
        }
    });

	return Level;
})
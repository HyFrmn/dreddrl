var DOOROPENTILE1 = { srcX : 2, srcY: 36}
var DOOROPENTILE2 = { srcX : 2, srcY: 37}
var DOORCLOSEDTILE1 = { srcX : 1, srcY: 36}
var DOORCLOSEDTILE2 = { srcX : 1, srcY: 37}

define(['sge'], function(sge){
    var Door = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.room = data.room;
            this.data.open = data.open===undefined ?  true : data.open;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){
            this.set('open', !this.get('open'));
            this.room.update();
            this.updateTiles();
        },
        updateTiles : function(){
            var tx = Math.floor(this.entity.get('xform.tx') / 32);
            var ty = Math.floor(this.entity.get('xform.ty') / 32);
            if (this.get('open')==true){
                tile = this.map.getTile(tx,ty-2);
                tile.passable=true;
                tile = this.map.getTile(tx,ty-1);
                tile.layers['layer1'] = DOOROPENTILE1;
                tile.passable=true;
                tile = this.map.getTile(tx,ty);
                tile.passable=true;
                tile.layers['layer1'] = DOOROPENTILE2;
            } else {
                tile = this.map.getTile(tx,ty-2);
                tile.passable=false;
                tile = this.map.getTile(tx,ty-1);
                tile.layers['layer1'] = DOORCLOSEDTILE1;
                tile.passable=false;
                tile = this.map.getTile(tx,ty);
                tile.layers['layer1'] = DOORCLOSEDTILE2;
                tile.passable=false;
            }
            //this.map.renderTiles(this.state.game.renderer, [[tx,ty-2],[tx, ty-1],[tx,ty]]);
            this.map.renderTiles(this.state.game.renderer, this.room.getTiles());
            
        },

    	register: function(state){
			this.state = state;
            this.map = state.map;
            this.updateTiles();
		},
		unregister: function(){
			this.state = null;
            this.map = null;
		}
    });
    sge.Component.register('door', Door);
    return Door
})
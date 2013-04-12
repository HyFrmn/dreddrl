var DOOROPENTILE1 = { srcX : 2, srcY: 36}
var DOOROPENTILE2 = { srcX : 2, srcY: 37}
var DOORCLOSEDTILE1 = { srcX : 1, srcY: 36}
var DOORCLOSEDTILE2 = { srcX : 1, srcY: 37}

define(['sge'], function(sge){
    var Door = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.room = data.room;
            this.data.locked = data.locked || false;
            this.data.open = data.open===undefined ?  true : data.open;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){
            if (this.get('locked')){
                this.entity.fireEvent('log','Door is locked');
            } else {
                this.set('open', !this.get('open'));
                this.room.update();
                this.updateTiles();
            }
        },
        createTiles : function(){
            var tx = Math.floor(this.entity.get('xform.tx') / 32);
            var ty = Math.floor(this.entity.get('xform.ty') / 32);
            this.tileA = new CAAT.Actor().setLocation(tx*32+16,ty*32+16).setFillStyle('#FF0000').setSize(30,30);
            this.tileB = new CAAT.Actor().setLocation(tx*32+16,(ty-1)*32+16).setFillStyle('#FF0000').setSize(30,30);
            var frame = DOORCLOSEDTILE1.srcY * 8 + DOORCLOSEDTILE1.srcX;
            this.tileB.setBackgroundImage(sge.Renderer.SPRITESHEETS['future2']).setSpriteIndex(frame);
            var frame = DOORCLOSEDTILE2.srcY * 8 + DOORCLOSEDTILE2.srcX;
            this.tileA.setBackgroundImage(sge.Renderer.SPRITESHEETS['future2']).setSpriteIndex(frame);
            this.map.dynamicContainer.addChild(this.tileA);
            this.map.dynamicContainer.addChild(this.tileB);
        },
        updateMapTiles : function(){
            var tx = Math.floor(this.entity.get('xform.tx') / 32);
            var ty = Math.floor(this.entity.get('xform.ty') / 32);
            tile = this.map.getTile(tx,ty-2);
            tile.passable=true;
            tile = this.map.getTile(tx,ty-1);
            tile.layers['layer1'] = DOOROPENTILE1;
            tile.passable=true;
            tile = this.map.getTile(tx,ty);
            tile.passable=true;
            tile.layers['layer1'] = DOOROPENTILE2;
        },

        updateTiles : function(){
            if (this.get('open')){
                this.tileA.setVisible(false);
                this.tileB.setVisible(false);
            } else {
                this.tileA.setVisible(true);
                this.tileB.setVisible(true);
            }
        },

        register: function(state){
            this.state = state;
            this.map = state.map;
            this.updateMapTiles();
            this.createTiles();
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
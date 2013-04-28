define(['sge'], function(sge){
    var Elevator = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.open = data.open || true;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){
            this.state.newLevel();
        },
        updateTiles : function(){
            var tx = Math.floor(this.entity.get('xform.tx') / 32)-1;
            var ty = Math.floor(this.entity.get('xform.ty') / 32)-2
            
            for (var y=0;y<3;y++){
                for (var x=0;x<3;x++){
                    tile = this.map.getTile(tx+x,ty+y);
                    //tile.passable=true;
                    tile.layers['layer1'] = {srcX: x,srcY: 32+y, spriteSheet:"future1"}
                }
            }
        },

    	register: function(state){
			this._super(state);
            this.map = state.map;
            this.updateTiles();
		},
    });
    sge.Component.register('elevator', Elevator);
    return Elevator
})

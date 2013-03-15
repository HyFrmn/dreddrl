define(['sge'], function(sge){
    var Elevator = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.open = data.open || true;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact);
        },
        interact: function(){

        },
        updateTiles : function(){
            var tx = Math.floor(this.entity.get('xform.tx') / 32)-1;
            var ty = Math.floor(this.entity.get('xform.ty') / 32)-2
            
            for (var y=0;y<3;y++){
                for (var x=0;x<3;x++){
                    tile = this.map.getTile(tx+x,ty+y);
                    //tile.passable=true;
                    tile.layers['layer1'] = {srcX: x,srcY: 32+y, spritesheet:"future1"}
                }
            }
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
    sge.Component.register('elevator', Elevator);
    return Elevator
})
define(['sge'], function(sge){
    var boxcoords = function(sx, sy, width, height){
        /*
         * Return  a lit of coordinates that are in the box starting
         * at sx, sy and had demisions of width and height.
         */
        var coords = [];
        for (var y=0; y<=height;y++){
            for (var x=0; x<=width;x++){
                coords.push([sx+x,sy+y]);
            }
        }
        return coords;
    };
    
    var Region = sge.Class.extend({
        init: function(state, left, right, top, bottom, options){
            this.state = state;
            this.data = {};
            this.entities = [];
            this._setSize(left, right, top, bottom);
            this.options = options || {};
            this.state._addRegion(this);
        },
        _setSize: function(left, right, top, bottom){
            this.data.left = left;
            this.data.right = right;
            this.data.top = top;
            this.data.bottom = bottom;
            this.data['xform.tx'] = (right - left)/2 + left;
            this.data['xform.ty'] = (bottom - top)/2 + top;

        },
        onRegionEnter: function(){},
        onRegionExit: function(){},
        get: function(attr){
            return this.data[attr];
        },
        test : function(tx, ty, padding){
            padding = padding === undefined ? 0 : padding;
            return Boolean((tx>this.data.left+padding)&&(tx<this.data.right-padding)&&(ty>this.data.top+padding)&&(ty<this.data.bottom-padding));
        },
        getTiles : function(){
            var coords = boxcoords(Math.floor(this.data.left/32), Math.floor(this.data.top/32), Math.floor((this.data.right-this.data.left)/32), Math.floor((this.data.bottom-this.data.top)/32));
            return this.state.map.getTiles(coords);
        },
        spawn : function(name, data, spawn){
            if (spawn===undefined){
                spawn=true;
            }
            var tx, ty, entity;
            var tile = sge.random.item(this.getTiles());
            if (tile){
                while (tile.data.spawn!==undefined||tile.passable!=true){
                    tile = sge.random.item(this.getTiles());
                };
                tx = tile.x * 32 + 16;
                ty = tile.y * 32 + 16;
                tile.spawn = true;
            }
            if (typeof name==='string'){
                data = data || {};
                data['xform'] = {tx: tx, ty: ty};
                entity = this.state.createEntity(name, data);
                if (spawn){
                    this.state.addEntity(entity);
                }
                
            } else {
                entity = name;
                entity.set('xform.t', tx, ty);
                if (!entity.id&&spawn){
                    this.state.addEntity(entity);
                }
            }
            return entity;
        },
    })

    return Region
});
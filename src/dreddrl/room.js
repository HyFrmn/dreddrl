define(['sge','./region'], function(sge, Region){
    var FLOORTILE =  { srcX : 0, srcY: 2};
    var FLOORTILE2 =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 1, srcY: 3, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 2, srcY: 4}
    var DOOROPENTILE2 = { srcX : 2, srcY: 5}
    var DOORCLOSEDTILE1 = { srcX : 1, srcY: 4}
    var DOORCLOSEDTILE2 = { srcX : 1, srcY: 5}
    
    var Room = Region.extend({
        init: function(state, name, left, right, top, bottom, options){
            this._super(state, name, left, right, top, bottom, options);
            this.options = _.extend({open: false, locked: false}, this.options);
            this.doors = [];
            this.cover = new CAAT.Actor().
                            setFillStyle('black').
                            setAlpha(0.65).
                            setBounds(left, top, right-left, bottom-top).
                            setVisible(false);
            this.state.map.canopyDynamic.addChild(this.cover);
        },
        isLocked : function(){
            var locked = false;
            _.each(this.doors, function(door){
                locked = door.get('door.locked');
            });
            return locked;
        },
        openDoors : function(){
            _.each(this.doors, function(door){
                door.set('door.open', true);
                door.get('door').updateTiles();
            });
            this.update();
        },
        closeDoors : function(){
            _.each(this.doors, function(door){
                door.set('door.open', false);
                door.get('door').updateTiles();
            });
            this.update();
        },
        lockDoors : function(keyType){
            this.closeDoors();
            _.each(this.doors, function(door){
                door.set('door.locked', keyType || true);
            });
            this.update();
        },
        unlockDoors : function(){
            _.each(this.doors, function(door){
                door.set('door.locked', false);
            });
            this.update();
        },
        update: function(){
            if (this.doors.length){
                if (this.doors[0].get('door.open')){
                    this.cover.setVisible(false);
                    _.each(this.entities, function(e){
                        e.set('active', true);
                        e.get('xform.container').setVisible(true);
                    })
                } else {
                    this.cover.setVisible(true);
                    _.each(this.entities, function(e){
                        if (e.get('door')==null){
                            e.set('active', false);
                            e.get('xform.container').setVisible(false);
                        }
                    });
                }
            } else { 
                this.cover.setVisible(true);
            }
        }
    })

    /*
        Std Sizes:
            Room: 5 x 5
            Room Wall Size: +1/+6
            Cooridor Size: 2
            Full Cooridor Height: 24
            Full Cooridor Width: 6
    */

    return Room;
})
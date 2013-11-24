define(['sge','./region'], function(sge, Region){
    var FLOORTILE =  { srcX : 0, srcY: 2};
    var FLOORTILE2 =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 1, srcY: 3, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 2, srcY: 4}
    var DOOROPENTILE2 = { srcX : 2, srcY: 5}
    var DOORCLOSEDTILE1 = { srcX : 1, srcY: 4}
    var DOORCLOSEDTILE2 = { srcX : 1, srcY: 5}
    
    var MegaBlockRoom = Region.extend({
        init: function(level, cx, cy, width, height, options){
            var realWidth = width * 32;
            var realHeight = height * 32;
            this._tileWidth = width;
            this._tileHeight = height;
            var top = (cy*32) - (realHeight/2) - 48;
            var bottom = (cy*32) + (realHeight/2) + 80;
            var left = (cx*32)-(realWidth/2) + 16;
            var right = (cx*32)+(realWidth/2) + 16;

            this._super(level.state, left, right, top, bottom, options);
            this.data.cx = cx;
            this.data.cy = cy;
            this.level = level;
            this._populated = false;

            this.options = _.extend({doors:'bottom', open: false, locked: false}, this.options);

            this.doors = [];
            this.plot();

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
        plot : function(){

            var halfX = Math.floor((this._tileWidth-1)/2);
            var halfY = Math.floor((this._tileHeight-1)/2);
            
            var tile = null;
           
            this.level.buildWall((this.data.cx-halfX),(this.data.cy-halfY)-2,this._tileWidth);
            this.level.buildWall((this.data.cx-halfX)-1,(this.data.cy+halfY)+2,this._tileWidth+2);
            
            for (x=(this.data.cx-halfX-1);x<=(this.data.cx+halfX+1);x++){
                tile = this.level.map.getTile(x,(this.data.cy+halfY)+1);
                tile.layers['canopy'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
                tile = this.level.map.getTile(x,(this.data.cy-halfY)-3);
                tile.layers['canopy'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
            }
            for (y=(this.data.cy-halfY-2);y<=(this.data.cy+halfY+1);y++){
                tile = this.level.map.getTile((this.data.cx+halfX)+1,y);
                tile.layers['canopy'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
                tile = this.level.map.getTile((this.data.cx-halfX)-1,y);
                tile.layers['canopy'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
            }

            if ((this.options.doors=='bottom')||(this.options.doors=='both')){
                this.createDoor(this.data.cx, this.data.cy+halfY+3, this.options.open);
            } 
            if ((this.options.doors=='top')||(this.options.doors=='both')) {
                this.createDoor(this.data.cx, this.data.cy-halfY-1, this.options.open);
            }
            console.log('PLOT', CEILTILE)
            if ((this.options.doors=='elevator')){
                this.createElevator(this.data.cx, this.data.cy+halfY+3, this.options.up);
            }
            this.cover = new CAAT.Actor().
                                setFillStyle('black').
                                setAlpha(0.65).
                                setSize(this._tileWidth*32,
                                        (2+this._tileHeight)*32).
                                setLocation((this.data.cx-(this._tileWidth-1)/2)*32,
                                            (this.data.cy-(this._tileHeight+3)/2)*32);
            this.state.map.canopy.addChild(this.cover);
        },

        createDoor : function(cx, cy, open){
            var door = this.state.createEntity('door', {
                xform:{
                    tx: ((cx + 0.5) * 32),
                    ty: ((cy + 0.5) * 32),
                }, door: {
                    open: open,
                    room: this,
                    locked: this.options.locked
                }
            });
            this.doors.push(door);
            door.tags.push('door');
            this.state.addEntity(door);
            return door;
        },

        createElevator : function(cx, cy, up){
            this._populated = true;
            var door = this.state.createEntity('elevator', {xform:{
                tx: ((cx + 0.5) * 32),
                ty: ((cy + 0.5) * 32),
            }, 
            highlight: {
                focusColor: (up ? 'orange' : 'blue'),
            },
            elevator: {
                up: Boolean(up)
            }});
            this.state.addEntity(door);
            return door;
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
        },

        onRegionEnter: function(entity){
            this._updateHighlight();
        },

        onRegionExit: function(entity){
            this._updateHighlight();
        },

        highlight: function(highlight){
            if (highlight){
                this._highlight = true;
            } else {
                this._highlight = false;
            }
            this._updateHighlight();
        },

        _updateHighlight: function(){
            var evt = null;
            if (this._highlight){
                if (this.level.state.pc._regions.indexOf(this)>=0){
                    evt = 'highlight.off';
                } else {
                    evt = 'highlight.on';
                }
            } else {
                evt = 'highlight.off';
            }
            if (evt){
                this.doors.forEach(function(d){d.fireEvent(evt)});
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

    return MegaBlockRoom;
})
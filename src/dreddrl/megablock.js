define([
    'sge',
    './factory',
    './map',
    './quest'
],
function(sge, Factory, Map, Quest){
    var FLOORTILE =  { srcX : 0, srcY: 2};
    var FLOORTILE2 =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 1, srcY: 3, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 2, srcY: 4}
    var DOOROPENTILE2 = { srcX : 2, srcY: 5}
    var DOORCLOSEDTILE1 = { srcX : 1, srcY: 4}
    var DOORCLOSEDTILE2 = { srcX : 1, srcY: 5}



    var MegaBlockRoom = Map.Region.extend({
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
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
                tile = this.level.map.getTile(x,(this.data.cy-halfY)-3);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
            }
            for (y=(this.data.cy-halfY-2);y<=(this.data.cy+halfY+1);y++){
                tile = this.level.map.getTile((this.data.cx+halfX)+1,y);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
                tile = this.level.map.getTile((this.data.cx-halfX)-1,y);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile.transparent = false;
            }
            if ((this.options.doors=='bottom')||(this.options.doors=='both')){
                this.createDoor(this.data.cx, this.data.cy+halfY+3, this.options.open);
            } 
            if ((this.options.doors=='top')||(this.options.doors=='both')) {
                this.createDoor(this.data.cx, this.data.cy-halfY-1, this.options.open);
            }
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
                        e.set('active', false);
                        e.get('xform.container').setVisible(false);
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

    var MegaBlock = sge.Class.extend({
        init: function(){
            this.level = 0;
            this.levels = [];
            var level = {};
            this.levels.push(level);
            var level = {};
            this.levels.push(level);
            var level = {};
            this.levels.push(level);
        },
        getCurrentLevel: function(state){
            var lvl = new MegaBlockLevel(this, state);
            return lvl;
        }
    });

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
    })

	var MegaBlockLevel = Level.extend({
		init: function(block, state, options){

            options = _.extend({
                padding: 3,
                width: 6,
                height: 2,
            }, options || {});
            this.width = options.width*6 + options.padding*2 + 1;
            this.height = (options.height * 21) + options.padding+2 + 8;
            this.block = block;

            this._super(state, options);
            this.rooms = [];
            this.block = block;

            var marketLeft =this.width*32;
            var marketRight =  0;
            var marketTop = this.height*32;
            var marketBottom = 0;

            _.each(this.map._tiles, function(t){
                if ((t.x>(this.width/3)&&t.x<(this.width*2/3))&&(t.y>(this.height/3)&&t.y<(this.height*2/3))) {
                    t._mask=true;
                    t.layers = {
                        'layerBase' : FLOORTILE
                    }
                } else {
                    t._mask = false;
                    t.layers = {
                        'layerBase' : FLOORTILE
                    }
                }
                t.fade = 0;
                
            }.bind(this));

            //Build Rooms
            //*
            var rooms = null;
            for (var i=0;i<options.width;i++){
                for (var j=0;j<options.height;j++){
                    var tx = 3+options.padding+(6*i);
                    var ty = 7+options.padding+(21*j);

                    if (this.map.getTile(tx,ty)._mask!=true){
                        var locked = (Math.random() > 0.5 ? true : false);
                        var open =  false; //(Math.random() > 0.5 ? true : false);
                        var up = true;
                        if (!open){
                            locked = (Math.random() > 0.75 ? true : false)
                        }
                        doors = 'bottom';
                        if (i==0||i==options.width-1){
                            doors = 'elevator';
                            if (i==0){
                                up = false;
                            }
                        }
                        room = new MegaBlockRoom(this, tx, ty, 5, 5, {open: open, locked: locked, doors: doors, up: up});
                        room.name = 'Room ' + i + '-' + j + ' A';
                        this.rooms.push(room);

                    } else {
                        marketLeft = Math.min(marketLeft, tx*32);
                        marketRight = Math.max(marketRight, tx*32+32);
                        marketTop = Math.min(marketTop, ty*32);
                        marketBottom = Math.max(marketBottom, ty*32+32);
                    }
                    tx = 3+options.padding+(6*i);
                    ty = 7+options.padding+13+(21*j);
                    if (this.map.getTile(tx,ty)._mask!=true){
                        var locked = (Math.random() > 0.5 ? true : false);
                        var open = false;//
                        if (!open){
                            locked = (Math.random() > 0.75 ? true : false)
                        }
                        room = new MegaBlockRoom(this, tx, ty, 5, 5, {doors: 'top', open: open, locked: locked});
                        room.name = 'Room ' + i + '-' + j + ' B';
                        this.rooms.push(room);
                    } else {
                        marketLeft = Math.min(marketLeft, tx*32);
                        marketRight = Math.max(marketRight, tx*32+32);
                        marketTop = Math.min(marketTop, ty*32);
                        marketBottom = Math.max(marketBottom, ty*32+32);

                    }
                }
            }

            this.buildBorders();

            this.market = new Map.Region(this.state, marketLeft, marketRight, marketTop, marketBottom);
            this.market.name = 'Market';
            this.market.getTiles().forEach(function(t){
                t.layers = {
                    'layerBase' : FLOORTILE2
                }
            })
    
            //Populate market place.
            //*
            var npcs=2;
            var citizen = null;
            while (npcs--){
                var tx = sge.random.range(this.market.data.left, this.market.data.right);
                var ty = sge.random.range(this.market.data.top, this.market.data.bottom);
                var tile = this.map.getTile(Math.floor(tx/32),Math.floor(ty/32));
                while (!tile.passable){
                    tx = sge.random.range(this.market.data.left, this.market.data.right);
                    ty = sge.random.range(this.market.data.top, this.market.data.bottom);
                    tile = this.map.getTile(Math.floor(tx/32),Math.floor(ty/32));
                }
                citizen =  this.state.createEntity('citizen',{
                    xform: {
                        tx: tx,
                        ty: ty
                    },
                    ai: {
                        region: this.market
                    }
                });
                this.state.addEntity(citizen);
                citizen.tags.push('shopper');
            }

            var lawbreakers=1;
            var lawbreaker = null;
            while (lawbreakers--){
                var tx = sge.random.range(this.market.data.left, this.market.data.right);
                var ty = sge.random.range(this.market.data.top, this.market.data.bottom);
                var tile = this.map.getTile(Math.floor(tx/32),Math.floor(ty/32));
                while (!tile.passable){
                    tx = sge.random.range(this.market.data.left, this.market.data.right);
                    ty = sge.random.range(this.market.data.top, this.market.data.bottom);
                    tile = this.map.getTile(Math.floor(tx/32),Math.floor(ty/32));
                }
                lawbreaker =  this.state.createEntity('spacer',{
                    xform: {
                        tx: tx,
                        ty: ty
                    }
                });
                this.state.addEntity(lawbreaker)
            }
            //*/
            
        },
        setup: function(){
            Quest.Load(this);
            this.populateRooms();
            this._super();
        },
        populateRooms : function(){
            //Populate Rooms
            _.each(this.rooms, function(room){
               // console.log(room._populated)
                if (!room._populated){
                    room._populated = true;
                    var spawnType = sge.random.item(['resident','lawbreaker','spacer']);
                    room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });    
                    room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });
                    var e = room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });
                    /*
                    setTimeout(function(){
                        room.openDoors()
                        var ai = e.get('ai.behaviour');
                        ai.setBehaviour('goto', {
                            target: this.market
                        }).then(function(){
                            e.set('ai.region', this.market);
                            console.log(this.market);
                        }.bind(this)).then(ai.deferBehaviour('idle'));
                    }.bind(this), 3000)
                    */
                }
                room.update();
            }.bind(this));
        },
        
        addEntity: function(type, options){
            var entity = this.factory(type, options);
            this.state.addEntity(entity);
            //this._entities.push(entity);
            return entity;
        },
        updateState: function(){
            _.each(this._entities, function(entity){
                //this.state.addEntity(entity);
            }.bind(this));

        },
        tick : function(delta){
            //this.encounterSystem.tick();
        },
        getRandomRoom : function(options){
            options = options || {};
            var excludeList = options.exclude || [];
            var i = 0;
            goodRoom = null;
            for (var i=0;i<this.rooms.length;i++){
                var room = sge.random.item(this.rooms);
                if (_.include(excludeList, room)){
                    continue;
                }
                if (room.options.doors==null){
                    continue;
                }
                if (room.isLocked()){
                    continue;
                }
                if (options.territory!==undefined){
                    if (room.data.territory!=options.territory){
                        continue;
                    }
                }
                if (room._populated){
                    continue
                }
                var goodRoom = room;
                break;
            }
            goodRoom._populated = true;
            return goodRoom;
        },
	});

    return {
        MegaBlock : MegaBlock,
        MegaBlockLevel : MegaBlockLevel,
        MegaBlockRoom : MegaBlockRoom
    }

});
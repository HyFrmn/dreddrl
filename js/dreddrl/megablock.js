define([
    'sge',
    './factory',
    './encounters',
    './map'
    ],
    function(sge, Factory, encounters, Map){
    	var FLOORTILE =  { srcX : 0, srcY: 0, spriteSheet: 'future2'};
        var FLOORTILE2 =  { srcX : 1, srcY: 1, spriteSheet: 'future2'};
        var CEILTILE = { srcX : 0, srcY: 36, layer: "canopy", spriteSheet: 'future2'}
        var DOOROPENTILE1 = { srcX : 1, srcY: 36, spriteSheet: 'future2'}
        var DOOROPENTILE2 = { srcX : 1, srcY: 37, spriteSheet: 'future2'}
        var DOORCLOSEDTILE1 = { srcX : 2, srcY: 36, spriteSheet: 'future2'}
        var DOORCLOSEDTILE2 = { srcX : 2, srcY: 37, spriteSheet: 'future2'}

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

        var MegaBlockRoom = sge.Class.extend({
            init: function(gen, cx, cy, width, height, options){
                this.level = gen;
                this.options = _.extend({doors:'bottom', open: true, locked: false}, options ||{})
                this.cx = cx
                this.cy = cy
                this.width = width;
                this.height = height;
                this.spawned = [];
                this.data = {};
                this.doors = [];
                this.plot();
                this.level.rooms.push(this);
            },
            isLocked : function(){
                var locked = false;
                _.each(this.doors, function(door){
                    locked = door.get('door.locked');
                });
                return locked;
            },
            plot : function(){
                var halfX = Math.floor((this.width-1)/2);
                var halfY = Math.floor((this.height-1)/2);

                var tile = null;
                for (var y=(this.cy-halfY);y<=(this.cy+halfY);y++){
                    for (var x=(this.cx-halfX);x<=(this.cx+halfX);x++){
                        tile = this.level.map.getTile(x,(this.cy+halfY)+1);
                        tile.layers['layer0'] = FLOORTILE;
                        tile.passable = true;
                    }
                }
                this.level.buildWall((this.cx-halfX),(this.cy-halfY)-2,this.width);
                this.level.buildWall((this.cx-halfX)-1,(this.cy+halfY)+2,this.width+2);
                for (x=(this.cx-halfX-1);x<=(this.cx+halfX+1);x++){
                    tile = this.level.map.getTile(x,(this.cy+halfY)+1);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                    tile.transparent = false;
                    tile = this.level.map.getTile(x,(this.cy-halfY)-3);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                    tile.transparent = false;
                }
                for (y=(this.cy-halfY-2);y<=(this.cy+halfY+1);y++){
                    tile = this.level.map.getTile((this.cx+halfX)+1,y);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                    tile.transparent = false;
                    tile = this.level.map.getTile((this.cx-halfX)-1,y);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                    tile.transparent = false;
                }
                
                if ((this.options.doors=='bottom')||(this.options.doors=='both')){
                    this.createDoor(this.cx, this.cy+halfY+3, this.options.open);
                } 
                if ((this.options.doors=='top')||(this.options.doors=='both')) {
                    this.createDoor(this.cx, this.cy-halfY-1, this.options.open);
                }

                this.cover = new CAAT.Actor().setFillStyle('black').setSize(this.width*32,this.height*32).setLocation((this.cx-(this.width-1)/2)*32+16, (this.cy-(this.height-1)/2)*32+16);
                this.level.map.canopy.addChild(this.cover);

                this.update();
            },
            createDoor : function(cx, cy, open){
                var door = this.level.addEntity('door', {xform:{
                    tx: ((cx + 0.5) * 32),
                    ty: ((cy + 0.5) * 32),
                }, door: {open: open, room: this, locked: this.options.locked},
                interact : {
                    targets: [[((cx + 0.5) * 32),((cy + 0.5) * 32)],[((cx + 0.5) * 32),((cy - 1.5) * 32)]]
                }});
                this.doors.push(door);
                door.tags.push('door');
                return door;
            },
            getTiles : function(){
                return this.level.map.getTiles(boxcoords(this.cx - (this.width-1)/2,this.cy - (this.height-1)/2, this.width-1, this.height-1));
            },
            spawn : function(name, data){
                data = data || {};
                var tile = sge.random.item(this.getTiles());
                if (tile){
                    while (tile.data.spawn!==undefined){

                        tile = sge.random.item(this.getTiles());
                    };
                    data['xform'] = {tx: tile.x * 32 + 16, ty: tile.y * 32 + 16};
                    tile.spawn = true;
                    var entity = this.level.addEntity(name, data);
                    return entity;
                }
            },
            update: function(){
                if (this.doors.length){
                    //console.log('Update',this.doors[0].get('door.open'));
                    if (this.doors[0].get('door.open')){
                        _.each(this.getTiles(), function(tile){
                            tile.fade = 0;
                            tile.update();
                        });
                        this.cover.setVisible(false);
                    } else {
                        _.each(this.getTiles(), function(tile){
                            tile.fade = 1;
                            tile.update();
                        })
                        this.cover.setVisible(true);
                    }
                } else { 
                    _.each(this.getTiles(), function(tile){
                        tile.fade = 1;
                        tile.update();
                    })
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

    	var MegaBlockLevel = sge.Class.extend({
    		init: function(block, state){
                this._entities = [];
                this.rooms = [];

                this.options = {
                    padding: 3,
                    width: 9,
                    height: 5,
                }

                this.width = this.options.width*6 + this.options.padding*2 + 1;
                this.height = (this.options.height * 21) + this.options.padding+2 + 8;
                this.state = state;
                this.map = new Map(this.width,this.height,{src: ['assets/tiles/future1.png', 'assets/tiles/future2.png','assets/tiles/future3.png','assets/tiles/future4.png']});
    			this.map.defaultSheet = 'future2';
                
                state.map  = this.map
                this.block = block;
                this.map = state.map;
                this.factory = state.factory;
                _.each(this.map._tiles, function(t){
                    if ((t.x>(this.width/3)&&t.x<(this.width*2/3))&&(t.y>(this.height/3)&&t.y<(this.height*2/3))) {
                        t._mask=true;
                        t.layers = {
                            'layer0' : FLOORTILE2
                    }
                    } else {
                        t._mask = false;
                        t.layers = {
                            'layer0' : FLOORTILE
                    }
                    }
                    t.fade = 0;
                    
                }.bind(this));

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


                //Build Rooms
                var rooms = null;
                for (var i=0;i<this.options.width;i++){
                    for (var j=0;j<this.options.height;j++){
                        var tx = 3+this.options.padding+(6*i);
                        var ty = 7+this.options.padding+(21*j);
                        if (this.map.getTile(tx,ty)._mask!=true){
                            var locked = false;
                            var open = (Math.random() > 0.5 ? true : false);
                            if (!open){
                                locked = (Math.random() > 0.5 ? true : false)
                            }
                            room = new MegaBlockRoom(this, tx, ty, 5, 5, {open: open, locked: locked});
                        }
                        tx = 3+this.options.padding+(6*i);
                        ty = 7+this.options.padding+13+(21*j);
                        if (this.map.getTile(tx,ty)._mask!=true){
                            var locked = false;
                            var open = (Math.random() > 0.5 ? true : false);
                            if (!open){
                                locked = (Math.random() > 0.5 ? true : false)
                            }
                            room = new MegaBlockRoom(this, tx, ty, 5, 5, {doors: 'top', open: open, locked: locked});
                        }
                    }
                }



                //Populate Rooms
                _.each(this.rooms, function(room){
                    room.spawn('lawbreaker');
                    room.spawn('citizen');    
                    room.spawn('citizen');

                }.bind(this))


                for (var y=0;y<this.map.height-2;y++){
                    var tile = this.map.getTile(0, y);
                    tile.layers = {
                        'layer0' : CEILTILE
                    }
                    tile.passable = false;
                    tile = this.map.getTile(this.map.width-1, y);
                    tile.layers = {
                        'layer0' : CEILTILE
                    }
                    tile.passable = false;
                }

                var npcs=0;
                while (npcs--){
                    this.addEntity('citizen',{
                        xform: {
                            tx: sge.random.range(32, (this.map.width*32) - 64),
                            ty: sge.random.range(96, (this.map.height*32) - 192)
                        }
                    })
                }

                this.map.setup(this.state._entityContainer);
                this.updateState();
                
                 
                
                //Setup Encounter System
                //*
                this.encounterSystem = new encounters.EncounterSystem(this.state, this);
                this.encounterSystem.create(encounters.CheckupEncounter);
                this.encounterSystem.create(encounters.ExecuteEncounter);
                this.encounterSystem.create(encounters.SerialEncounter, encounters.rescueEncounterTemplate);
    		    //*/
            },
            buildWall: function(sx, sy, length, ceil){
                for (var x=0;x<length;x++){
                    var tile = this.map.getTile(x+sx, sy);
                    tile.layers = {
                        'layer0' : { srcX : 6, srcY: 1, spritesheet: 'future2'}
                    }
                    tile.passable = false;
                    tile = this.map.getTile(x+sx, sy+1);
                    tile.layers = {
                        'layer0' : { srcX : 6, srcY: 2, spritesheet: 'future2'}
                    }
                    tile.transparent = false;
                    tile.passable = false;
                    if (ceil){
                       tile = this.map.getTile(x+sx, sy-1);
                        tile.layers['layer0'] = CEILTILE;
                        tile.passable = false; 
                    }
                }
            },
            addEntity: function(type, options){
                var entity = this.factory(type, options);
                this._entities.push(entity);
                return entity;
            },
            updateState: function(){
                _.each(this._entities, function(entity){
                    this.state.addEntity(entity);
                }.bind(this));

            },
            tick : function(delta){
                this.encounterSystem.tick();
            },
            getRandomEncounterRoom : function(options){
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
                    var goodRoom = room;
                    break;
                }
                return goodRoom;
            },
    	});

    	var MegaBlock = sge.Class.extend({
    		init : function(){
    			this._levels = []; //Precompute Entire Block. (Memory? What's memory?)
    		},

    	})

        return {
            MegaBlock : MegaBlock,
            MegaBlockLevel : MegaBlockLevel,
            MegaBlockRoom : MegaBlockRoom
        }

    }
);
define([
    'sge',
    'jquery',
    './factory',
    './map'
    ],
    function(sge, $, Factory, Encounters, Map){
        var FLOORTILE =  { srcX : 0, srcY: 0, spriteSheet: 'future2'};
        var CEILTILE = { srcX : 0, srcY: 36, layer: "canopy", spriteSheet: 'future2'}
        var DOOROPENTILE1 = { srcX : 1, srcY: 36, spriteSheet: 'future2'}
        var DOOROPENTILE2 = { srcX : 1, srcY: 37, spriteSheet: 'future2'}
        var DOORCLOSEDTILE1 = { srcX : 2, srcY: 36, spriteSheet: 'future2'}
        var DOORCLOSEDTILE2 = { srcX : 2, srcY: 37, spriteSheet: 'future2'}


        var boxcoords = function(sx, sy, width, height){
            var coords = [];
            for (var y=0; y<=height;y++){
                for (var x=0; x<=width;x++){
                    coords.push([sx+x,sy+y]);
                }
            }
            return coords;
        };

        var Room = sge.Class.extend({
            init: function(gen, cx, cy, width, height, options){
                this.level = gen;
                this.options = $.extend({doors:'bottom', open: true}, options ||{})
                this.cx = cx
                this.cy = cy
                this.width = width;
                this.height = height;
                this.spawned = [];
                this.data = {};
                this.doors = [];
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
                    tile = this.level.map.getTile(x,(this.cy-halfY)-3);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                }
                for (y=(this.cy-halfY-2);y<=(this.cy+halfY+1);y++){
                    tile = this.level.map.getTile((this.cx+halfX)+1,y);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                    tile = this.level.map.getTile((this.cx-halfX)-1,y);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false;
                }
                
                if ((this.options.doors=='bottom')||(this.options.doors=='both')){
                    this.createDoor(this.cx, this.cy+halfY+3, this.options.open);
                } 
                if ((this.options.doors=='top')||(this.options.doors=='both')) {
                    this.createDoor(this.cx, this.cy-halfY-1, this.options.open);
                }

                this.update();
            },
            createDoor : function(cx, cy, open){
                var tile = null;
                var door = this.level.state.factory('door', {xform:{
                    tx: ((cx + 0.5) * 32),
                    ty: ((cy + 0.5) * 32),
                }, door: {open: open, room: this},
                interact : {
                    targets: [[((cx + 0.5) * 32),((cy + 0.5) * 32)],[((cx + 0.5) * 32),((cy - 1.5) * 32)]]
                }});
                this.doors.push(door);
                door.tags.push('door');
                this.level.state.addEntity(door);
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
                    var entity = Factory(name, data);
                    return entity;
                }
            },
            update: function(){
                if (this.doors.length){
                    //console.log('Update',this.doors[0].get('door.open'));
                    if (this.doors[0].get('door.open')){
                        _.each(this.getTiles(), function(tile){
                            tile.fade = 0;
                        })
                    } else {
                        _.each(this.getTiles(), function(tile){
                            tile.fade = 1;
                        })
                    }
                } else { 
                    _.each(this.getTiles(), function(tile){
                        tile.fade = 1;
                    })
                }
            }
        })

        var LevelGenerator = sge.Class.extend({
            init: function(state, options){
                this.state = state;
                this.map = state.map;
                _.each(this.map._tiles, function(t){
                    t.fade = 0;
                    t.layers = {
                            'layer0' : FLOORTILE
                    }
                });

                this.rooms = [];
                this.buildLayout();

                // Build level borders.
                this.buildWall(0,1,this.map.width,true);
                


                for (var y=0;y<this.map.height;y++){
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

                this.buildWall(0,this.map.height-2,this.map.width, true);

                //this.state.pc = this.createPC();
            },

            buildSmallRoomHall : function(sx, sy, ex, options){
                var remainder = length % 4;
                var i = sx
                while (i<(ex-10)){
                    var halfWidth = 1;
                    this.createRoom(i+2, sy + 5, 3, 5, options)
                    i += (halfWidth*2)+2;
                }
                this.buildWall(i,9,ex-i-1,true);
            },

            buildMediumRoomHall : function(sx, sy, ex, options){
                var remainder = length % 4;
                var i = sx
                while (i<(ex-6)){
                    var halfWidth = 2;
                    this.createRoom(i+3, sy + 5, 5, 5, options)
                    i += (halfWidth*2)+2;
                }
                this.buildWall(i,9,ex-i-1,true);
            },

            buildLargeRoomHall : function(sx, sy, ex, options){
                var remainder = length % 4;
                var i = sx
                while (i<(ex-6)){
                    var halfWidth = 3;
                    this.createRoom(i+4, sy + 5, 7, 5, options)
                    i += (halfWidth*2)+2;
                }
                this.buildWall(i,9,ex-i-1,true);
            },

            buildLayout : function(){
                //Elevator Shafts
                this.createRoom(4, 5, 7, 5, {doors: null});
                this.createRoom(60, 5, 7, 5, {doors: null});
                
                //Create Elevator Doors
                var elevator = Factory('elevator', {xform:{
                    tx: (2*32)+16,
                    ty: (11*32)+16
                }})
                this.state.addEntity(elevator);

                var elevator = Factory('elevator', {xform:{
                    tx: (6*32)+16,
                    ty: (11*32)+16
                }})
                this.state.addEntity(elevator);
                
                //Create Elevator Doors
                var elevator = Factory('elevator', {xform:{
                    tx: (58*32)+16,
                    ty: (11*32)+16
                }})
                this.state.addEntity(elevator);

                var elevator = Factory('elevator', {xform:{
                    tx: (62*32)+16,
                    ty: (11*32)+16
                }})
                this.state.addEntity(elevator);

                var tiles = this.map.getTiles(boxcoords(32, 0, 32, 32));
                _.each(tiles, function(tile){
                    tile.data.territory = 'albert';
                });

                var eco = sge.random.item(['slum','middle','upper']);
                switch (eco){
                    case 'upper':
                        //Upper Class
                        this.buildLargeRoomHall(8,0,60);
                        this.buildLargeRoomHall(8,13,60, {doors: 'top'});
                        this.buildLargeRoomHall(8,21,60);
                        this.buildLargeRoomHall(8,34,60, {doors: 'top'});
                        this.buildLargeRoomHall(8,42,60);
                        this.buildLargeRoomHall(8,55,60, {doors: 'top'});
                        break;

                    case 'middle':
                        this.buildMediumRoomHall(8,0,60);
                        this.buildMediumRoomHall(8,13,60, {doors: 'top'});
                        this.buildMediumRoomHall(8,21,60);
                        this.buildMediumRoomHall(8,34,60, {doors: 'top'});
                        this.buildMediumRoomHall(8,42,60);
                        this.buildMediumRoomHall(8,55,60, {doors: 'top'});
                        break;

                    case 'slum':
                    default:
                        this.buildSmallRoomHall(8,0,65);
                        this.buildSmallRoomHall(8,13,65, {doors: 'top'});
                        this.buildSmallRoomHall(8,21,65);
                        this.buildSmallRoomHall(8,34,65, {doors: 'top'});
                        this.buildSmallRoomHall(8,42,65);
                        this.buildSmallRoomHall(8,55,65, {doors: 'top'});
                        break;
                }

                //Spawn Gang
                //*
                _.each(this.rooms, function(room){
                    if (room.options.doors==null){
                        return;
                    }
                    _.each(room.doors, function(door){
                        if (!door.get('door.open')){
                            if (sge.random.unit() > 0.5){
                                door.set('door.locked', true);
                            }
                        }
                    })
                    var tile = this.map.getTile(room.cx, room.cy)
                    if (tile.data.territory == 'albert'){
                        var total = sge.random.rangeInt(0,3);
                        room.data.gang = tile.data.territory;
                        for (var i=0;i<total;i++){
                            var enemy = room.spawn('enemy');
                            if (enemy){
                                this.state.addEntity(enemy);
                            }
                        }
                    } else {
                        var total = sge.random.rangeInt(0,3);
                        room.data.territory = tile.data.territory;
                        for (var i=0;i<total;i++){
                            if (Math.random() > 0.5){
                                var type = 'man';
                            } else {
                                var type = sge.random.item(['woman', 'woman.young', 'woman.old'])
                            }
                            var npcData = { actions:{ interact: ['event', 'this', 'emote.msg', "Hi, I'm an npc."]}, interact: { dist: 48}, emote: {}}; 
                            var enemy = room.spawn(type, npcData);
                            if (enemy){
                                this.state.addEntity(enemy);
                            }
                            _.each(room.doors, function(door){
                                door.set('door.locked', false) 
                            })
                        }
                    }
                }.bind(this));
                //*/
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
                    tile.passable = false;
                    if (ceil){
                       tile = this.map.getTile(x+sx, sy-1);
                        tile.layers['layer0'] = CEILTILE;
                        tile.passable = false; 
                    }
                }
            },
            createPC : function(){
                var room = this.getRandomEncounterRoom();
                _.each(room.doors, function(door){
                    door.set('door.open', true);
                    door.get('door').updateTiles()
                });
                room.update()
                var pc = null;
                if (this.state.options.persist){
                    if (this.state.options.persist['pc']!==undefined){
                        pc = this.state.options.persist['pc'];
                        pc.set('xform.tx', (this.generator.rooms[0].cx + 0.5) * this.map.tileSize);
                        pc.set('xform.ty', (this.generator.rooms[0].cy + 0.5) * this.map.tileSize);
                    }
                }
                if (pc==null){
                    pc = Factory('pc', {
                        xform : {
                            tx: (room.cx + 0.5) * this.map.tileSize,
                            ty: (room.cy + 0.5) * this.map.tileSize,
                            vx : Math.random() * 10 - 5,
                            vy : Math.random() * 10 - 5
                        }});
                    pc.tags.push('pc');
                    pc.addListener('kill', function(){
                        this.state._killList.push(pc);
                    }.bind(pc));
                }
                this.state.addEntity(pc);
                return pc;
            },
            createEnemy : function(tx, ty){
                var enemy = null;
                var passable = false
                enemy = Factory('enemy', {
                    xform : {
                        tx: (tx + 0.5) * this.map.tileSize,
                        ty: (ty + 0.5) * this.map.tileSize,
                        vx: Math.random() * 10 - 5,
                        vy: Math.random() * 10 - 5
                    }});
                enemy.tags.push('enemy');
                this.state.addEntity(enemy);
                return enemy;
            },
            createRoom : function(cx, cy, width, height, options){
                options = $.extend({doors:'bottom', open: (Math.random() > 0.5)}, options || {});
                var room = new Room(this, cx, cy, width, height, options);
                var tile = this.map.getTile(cx, cy);
                room.data.territory = tile.data.territory;
                room.plot();
                this.rooms.push(room);
            },
        });
        return LevelGenerator;
    }
)
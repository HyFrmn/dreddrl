define([
    'sge',
    './factory',
    './level',
    './region',
    './megablockroom',
    './quest'
],
function(sge, Factory, Level, Region, MegaBlockRoom, Quest){
    var FLOORTILE =  { srcX : 0, srcY: 2};
    var FLOORTILE2 =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 1, srcY: 3, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 2, srcY: 4}
    var DOOROPENTILE2 = { srcX : 2, srcY: 5}
    var DOORCLOSEDTILE1 = { srcX : 1, srcY: 4}
    var DOORCLOSEDTILE2 = { srcX : 1, srcY: 5}

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

            //Mask out space for the Marketplace 
            _.each(this.map._tiles, function(t){
                if ((t.x>(this.width/3)&&t.x<(this.width*2/3))&&(t.y>(this.height/3)&&t.y<(this.height*2/3))) {
                    t._mask=true;
                    t.layers = {
                        'base' : FLOORTILE
                    }
                } else {
                    t._mask = false;
                    t.layers = {
                        'base' : FLOORTILE
                    }
                }
                t.fade = 0;
                
            }.bind(this));
            
            //Build Rooms
            var rooms = null;
            for (var i=0;i<options.width;i++){
                for (var j=0;j<options.height;j++){
                    var tx = 3+options.padding+(6*i);
                    var ty = 7+options.padding+(21*j);
                    room = null;
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
                        room = new MegaBlockRoom(this, 'Room ' + i + '-' + j + ' A', tx, ty, 5, 5, {open: open, locked: locked, doors: doors, up: up});
                        this.rooms.push(room);

                        if (room){
                            computer = this.state.createEntity('computer');
                            this.state.addEntity(computer);
                            computer.set('xform.tx', room.get('xform.tx')-64);
                            computer.set('xform.ty', room.get('xform.ty')-64);
                            tile = this.state.map.getTile(Math.floor((room.get('xform.tx')-64)/32),Math.floor((room.get('xform.ty')-64)/32));
                            tile.passable = false;

                            shelf = this.state.createEntity('shelf');
                            this.state.addEntity(shelf);
                            shelf.set('xform.tx', room.get('xform.tx')+64);
                            shelf.set('xform.ty', room.get('xform.ty')-64);
                            tile = this.state.map.getTile(Math.floor((room.get('xform.tx')+64)/32),Math.floor((room.get('xform.ty')-64)/32));
                            tile.passable = false;
                        }

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
                        room = new MegaBlockRoom(this, 'Room ' + i + '-' + j + ' B', tx, ty, 5, 5, {doors: 'top', open: open, locked: locked});
                        this.rooms.push(room);

                        if (room){
                            computer = this.state.createEntity('computer');
                            this.state.addEntity(computer);
                            computer.set('xform.tx', room.get('xform.tx')-64);
                            computer.set('xform.ty', room.get('xform.ty')-64);
                            tile = this.state.map.getTile(Math.floor((room.get('xform.tx')-64)/32),Math.floor((room.get('xform.ty')-64)/32));
                            tile.passable = false;

                            shelf = this.state.createEntity('shelf');
                            this.state.addEntity(shelf);
                            shelf.set('xform.tx', room.get('xform.tx')+64);
                            shelf.set('xform.ty', room.get('xform.ty')-64);
                            tile = this.state.map.getTile(Math.floor((room.get('xform.tx')+64)/32),Math.floor((room.get('xform.ty')-64)/32));
                            tile.passable = false;
                        }
                    } else {
                        marketLeft = Math.min(marketLeft, tx*32);
                        marketRight = Math.max(marketRight, tx*32+32);
                        marketTop = Math.min(marketTop, ty*32);
                        marketBottom = Math.max(marketBottom, ty*32+32);

                    }


                }
            }

            this.buildBorders();

            this.market = new Region(this.state, 'market', marketLeft, marketRight, marketTop, marketBottom);
            this.market.getTiles().forEach(function(t){
                t.layers = {
                    'base' : FLOORTILE2
                }
            })
    
            //Populate market place.
            //*
            this.criminals = [];
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
                citizen =  this.state.createEntity('resident',{
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
                    var e = room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });
                    if (spawnType!='resident'){
                        this.criminals.push(e);
                    }
                    var e = room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });
                    if (spawnType!='resident'){
                        this.criminals.push(e);
                    }
                    var e = room.spawn(spawnType, {
                        ai: {
                            region: room
                        }
                    });
                    if (spawnType!='resident'){
                        this.criminals.push(e);
                    }
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
        checkWin: function(){
            this.criminals = this.criminals.filter(function(entity){
                if (entity.id==null){
                    entity.fireEvent('state.log', '' + this.criminals.length + ' criminals remain.')
                    return false;
                }
                return true;
            }.bind(this));
            return (this.criminals.length==0)
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
        MegaBlockLevel : MegaBlockLevel
    }

});
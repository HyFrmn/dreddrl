define(['sge', './components/weapons', './components/physics', './components/judgemovement', './components/deaddrop'], function(sge){
    var FLOORTILE =  { srcX : 0, srcY: 0};
    var CEILTILE = { srcX : 0, srcY: 36, layer: "canopy"}
    var DOOROPENTILE1 = { srcX : 1, srcY: 36}
    var DOOROPENTILE2 = { srcX : 1, srcY: 37}
    var DOORCLOSEDTILE1 = { srcX : 2, srcY: 36}
    var DOORCLOSEDTILE2 = { srcX : 2, srcY: 37}

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

            this.buildWall(0,0,this.map.width);

            for (var y=0;y<this.map.height;y++){
                var tile = this.map.getTile(0, y);
                tile.layers = {
                    'layer0' : CEILTILE
                }
                tile.passable = false;
                tile = this.map.getTile(1, y);
                tile.layers = {
                    'layer0' : CEILTILE
                }
                tile.passable = false;
            }

            //Create floor opening.
            for (var y=24;y<40;y++){
                for (var x=24;x<40;x++){
                    var tile = this.map.getTile(x, y);
                    tile.layers = {
                        'layer0' : { srcX : 2, srcY: 0}
                    }
                    tile.passable = false;
                }
            }

            this.createRoom(16, 16);
            this.createRoom(20, 16);
            this.createRoom(24, 16);
            this.createRoom(28, 16);
            this.createRoom(32, 16);
            this.createRoom(36, 16);
            this.createRoom(40, 16);
            this.createRoom(44, 16);
            this.createRoom(48, 16);

            this.state.pc = this.createPC();
            for (var i=0;i<10;i++){
                this.createEnemy();
            }
        },
        buildWall: function(sx, sy, length){
            for (var x=0;x<length;x++){
                var tile = this.map.getTile(x+sx, sy);
                tile.layers = {
                    'layer0' : { srcX : 6, srcY: 1}
                }
                tile.passable = false;
                tile = this.map.getTile(x+sx, sy+1);
                tile.layers = {
                    'layer0' : { srcX : 6, srcY: 2}
                }
                tile.passable = false;
            }
        },
        createPC : function(){
            var pc = null;
            
            if (this.state.options.persist){
                if (this.state.options.persist['pc']!==undefined){
                    pc = this.state.options.persist['pc'];
                    pc.set('xform.tx', (this.generator.rooms[0].cx + 0.5) * this.map.tileSize);
                    pc.set('xform.ty', (this.generator.rooms[0].cy + 0.5) * this.map.tileSize);
                }
            }
            if (pc==null){
                pc = new sge.Entity({
                    xform : {
                        tx: (8 + 0.5) * this.map.tileSize,
                        ty: (8 + 0.5) * this.map.tileSize,
                        vx : Math.random() * 10 - 5,
                        vy : Math.random() * 10 - 5
                    },
                    controls : {},
                    sprite : {
                        src : 'assets/sprites/hunk.png',
                        width: 32,
                        offsetY: -8,
                        scale: 2
                    },
                    anim : {
                        frames: {
                            walk_down : [0,1,2],
                            walk_up : [9,10,11],
                            walk_right : [6,7,8],
                            walk_left : [3,4,5]
                        },
                    },
                    'judge.movement' : {
                        map: this.map,
                        speed: 16
                    },
                    health : {alignment:'good', life: 8},
                    physics : {},
                    weapons: {},
                    debug: {}
                });
                pc.tags.push('pc');
                pc.addListener('kill', function(){
                    this.state._killList.push(pc);
                }.bind(pc));
            }
            this.state.addEntity(pc);
            return pc;
        },
        createEnemy : function(){
            var enemy = null;
            var tx = sge.random.rangeInt(4,28);
            var ty = sge.random.rangeInt(4,28);
            var passable = false
            while (!passable){
                tx = sge.random.rangeInt(4,28);
                ty = sge.random.rangeInt(4,28);
                var tile = this.map.getTile(tx,ty);
                passable = tile.passable;
            }
            enemy = new sge.Entity({
                xform : {
                    tx: (tx + 0.5) * this.map.tileSize,
                    ty: (ty + 0.5) * this.map.tileSize,
                    vx: Math.random() * 10 - 5,
                    vy: Math.random() * 10 - 5
                },
                sprite : {
                    src : 'assets/sprites/albertbrownhair.png',
                    width: 32,
                    offsetY: -8,
                    scale: 2
                },
                anim : {
                    frames: {
                        walk_down : [0,1,2],
                        walk_up : [9,10,11],
                        walk_right : [6,7,8],
                        walk_left : [3,4,5]
                    },
                },
                movement : {
                    map: this.map,
                    speed: 16
                },
                health : {alignment:'evil', life: 5},
                simpleai : {},
                physics : {},
                debug: {},
                deaddrop: {}
            });
            enemy.tags.push('enemy');
            this.state.addEntity(enemy);
            return enemy;
        },
        createRoom : function(cx, cy){
            /*
            var cx = 16;  //sge.random.rangeInt(8,this.map.width-8);
            var cy = 16; //sge.random.rangeInt(8,this.map.height-8);
            */
            var halfX = 1;
            var halfY = 2;

            var tile = null;
            for (var y=(cy-halfY);y<=(cy+halfY);y++){
                for (var x=(cx-halfX);x<=(cx+halfX);x++){
                    tile = this.map.getTile(x,(cy+halfY)+1);
                    tile.layers['layer0'] = FLOORTILE;
                    tile.passable = true;
                }
            }
            this.buildWall((cx-halfX),(cy-halfY)-2,3);
            this.buildWall((cx-halfX)-1,(cy+halfY)+2,5);
            for (x=(cx-halfX-1);x<=(cx+halfX+1);x++){
                tile = this.map.getTile(x,(cy+halfY)+1);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile = this.map.getTile(x,(cy-halfY)-3);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
            }
            for (y=(cy-halfY-2);y<=(cy+halfY+1);y++){
                tile = this.map.getTile((cx+halfX)+1,y);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
                tile = this.map.getTile((cx-halfX)-1,y);
                tile.layers['layer0'] = CEILTILE;
                tile.passable = false;
            }
            this.createDoor(cx, cy+halfY+3, sge.random.unit() > 0.5);
        },
        createDoor : function(cx, cy, open){
            var tile = null;
            if (open){
                tile = this.map.getTile(cx,cy-1);
                tile.layers['layer1'] = DOOROPENTILE1;
                tile = this.map.getTile(cx,cy);
                tile.layers['layer1'] = DOOROPENTILE2;
            } else {
                tile = this.map.getTile(cx,cy-2);
                tile.passable=true;
                tile = this.map.getTile(cx,cy-1);
                tile.layers['layer1'] = DOORCLOSEDTILE1;
                tile.passable=true;
                tile = this.map.getTile(cx,cy);
                tile.layers['layer1'] = DOORCLOSEDTILE2;
                tile.passable=true;
            }
        }
    });
    return LevelGenerator;
})
define(['sge', 'jquery', './factory'], function(sge, $, Factory){
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

            this.buildWall(0,1,this.map.width,true);
            
            this.rooms = []

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

            //Create floor opening.
            for (var y=26;y<=38;y++){
                for (var x=26;x<=38;x++){
                    var tile = this.map.getTile(x, y);
                    tile.layers = {
                        'layer0' : { srcX : 2, srcY: 0}
                    }
                    tile.passable = false;
                }
            }
            this.createRoom(12, 5, 3, 5);
            this.createRoom(16, 5, 3, 5);
            this.createRoom(20, 5, 3, 5);
            this.createRoom(24, 5, 3, 5);
            this.createRoom(28, 5, 3, 5);
            this.createRoom(32, 5, 3, 5);
            this.createRoom(36, 5, 3, 5);
            this.createRoom(40, 5, 3, 5);
            this.createRoom(44, 5, 3, 5);
            this.createRoom(48, 5, 3, 5);


            this.createRoom(12, 18, 3, 5, {doors: 'top'});
            this.createRoom(16, 18, 3, 5, {doors: 'top'});
            this.createRoom(20, 18, 3, 5, {doors: 'top'});
            this.createRoom(24, 18, 3, 5, {doors: 'top'});
            this.createRoom(28, 18, 3, 5, {doors: 'top'});
            this.createRoom(32, 18, 3, 5, {doors: 'top'});
            this.createRoom(36, 18, 3, 5, {doors: 'top'});
            this.createRoom(40, 18, 3, 5, {doors: 'top'});
            this.createRoom(44, 18, 3, 5, {doors: 'top'});
            this.createRoom(48, 18, 3, 5, {doors: 'top'});

            this.createRoom(12, 46, 3, 5)
            this.createRoom(16, 46, 3, 5);
            this.createRoom(20, 46, 3, 5);
            this.createRoom(24, 46, 3, 5);
            this.createRoom(28, 46, 3, 5);
            this.createRoom(32, 46, 3, 5);
            this.createRoom(36, 46, 3, 5);
            this.createRoom(40, 46, 3, 5);
            this.createRoom(44, 46, 3, 5);
            this.createRoom(48, 46, 3, 5);

            this.createRoom(12, 58, 3, 5, {doors: 'top'});
            this.createRoom(16, 58, 3, 5, {doors: 'top'});
            this.createRoom(20, 58, 3, 5, {doors: 'top'});
            this.createRoom(24, 58, 3, 5, {doors: 'top'});
            this.createRoom(28, 58, 3, 5, {doors: 'top'});
            this.createRoom(32, 58, 3, 5, {doors: 'top'});
            this.createRoom(36, 58, 3, 5, {doors: 'top'});
            this.createRoom(40, 58, 3, 5, {doors: 'top'});
            this.createRoom(44, 58, 3, 5, {doors: 'top'});
            this.createRoom(48, 58, 3, 5, {doors: 'top'});

            this.createRoom(12, 32, 13, 7, {doors: 'both'});
            this.createRoom(52, 32, 13, 7, {doors: 'both'});

            this.state.pc = this.createPC();
            
            var npc = this.state.factory('women', {xform: {
                tx: this.state.pc.get('xform.tx'),
                ty: this.state.pc.get('xform.ty') + 64
            }});
            npc.tags.push('npc');
            this.state.addEntity(npc);
            
            this.state.daughter = null;
            
            /*
            for (var i=0;i<10;i++){
                this.createEnemy();
            }
            */
            
            var daughtersRoom = sge.random.item(this.rooms);
            npc = this.state.factory('daughter', {xform: {
                tx: daughtersRoom[0] * 32,
                ty: daughtersRoom[1] * 32 + 64
            }});
            npc.tags.push('npc');
            this.state.addEntity(npc);
        },
        buildWall: function(sx, sy, length, ceil){
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
                if (ceil){
                   tile = this.map.getTile(x+sx, sy-1);
                    tile.layers['layer0'] = CEILTILE;
                    tile.passable = false; 
                }
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
                pc = Factory('pc', {
                    xform : {
                        tx: (16 + 0.5) * this.map.tileSize,
                        ty: (32 + 0.5) * this.map.tileSize,
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
            this.rooms.push([cx, cy])
            options = $.extend({doors:'bottom', open: true}, options || {});
            /*
            var cx = 16;  //sge.random.rangeInt(8,this.map.width-8);
            var cy = 16; //sge.random.rangeInt(8,this.map.height-8);
            */
            var halfX = Math.floor((width-1)/2);
            var halfY = Math.floor((height-1)/2);

            var tile = null;
            for (var y=(cy-halfY);y<=(cy+halfY);y++){
                for (var x=(cx-halfX);x<=(cx+halfX);x++){
                    tile = this.map.getTile(x,(cy+halfY)+1);
                    tile.layers['layer0'] = FLOORTILE;
                    tile.passable = true;
                }
            }
            this.buildWall((cx-halfX),(cy-halfY)-2,width);
            this.buildWall((cx-halfX)-1,(cy+halfY)+2,width+2);
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
            if ((options.doors=='bottom')||(options.doors=='both')){
                this.createDoor(cx, cy+halfY+3, options.open);
            } 
            if ((options.doors=='top')||(options.doors=='both')) {
                this.createDoor(cx, cy-halfY-1, options.open);
            }

            if (Math.random()<0.65){
                this.createEnemy(cx,cy);
            }
            
            
        },
        createDoor : function(cx, cy, open){
            var tile = null;
            var door = this.state.factory('door', {xform:{
                tx: ((cx + 0.5) * 32),
                ty: ((cy + 0.5) * 32),
            }, door: {open: open}});
            door.tags.push('door');
            this.state.addEntity(door);
            /*
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
            */
        }
    });
    return LevelGenerator;
})
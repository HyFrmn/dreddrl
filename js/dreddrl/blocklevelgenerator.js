define(['sge', 'jquery', './factory', './encounters'], function(sge, $, Factory, Encounter){
    var FLOORTILE =  { srcX : 0, srcY: 0, spritesheet: 'future2'};
    var CEILTILE = { srcX : 0, srcY: 36, layer: "canopy", spritesheet: 'future2'}
    var DOOROPENTILE1 = { srcX : 1, srcY: 36, spritesheet: 'future2'}
    var DOOROPENTILE2 = { srcX : 1, srcY: 37, spritesheet: 'future2'}
    var DOORCLOSEDTILE1 = { srcX : 2, srcY: 36, spritesheet: 'future2'}
    var DOORCLOSEDTILE2 = { srcX : 2, srcY: 37, spritesheet: 'future2'}

    var CheckupEncounter = Encounter.extend({
        start: function(){
            //Create Mother
            var mothersRoom = sge.random.item(this.block.rooms);
            var mother = this.state.factory('women', {
                xform: {
                    tx: mothersRoom[0] * 32,
                    ty: mothersRoom[1] * 32
                },
                dialog: {
                    dialog :
                        ['switch', '${@(pc).quest.status}', 
                            [
                                ['dialog', "Please help me! I haven't seen my daughter all day. Can you find her and make sure she is ok. Thanks."],
                                ['set', '@(pc).quest.status', 1]
                            ],[
                                ['dialog', "Have you found my daughter yet?! I'm worried!"]
                            ],[
                                ['dialog', "Thank you for finding my daughter. Here take this for your trouble."],
                                ['set', '@(pc).quest.status', 3]
                            ],[
                                ['dialog', "Welcome to Peach Trees. "]
                            ]
                        ]
                }
            });
            mother.tags.push('mother');
            this.block.state.addEntity(mother);
            

            //Create Daughter
            var daughtersRoom = sge.random.item(this.block.rooms);
            var daughter = this.state.factory('daughter', {
                xform: {
                    tx: daughtersRoom[0] * 32,
                    ty: daughtersRoom[1] * 32
                },
                dialog: {
                   "dialog":
                        ['if', '${@(pc).quest.status}==1', 
                            [
                                ['dialog', "Yes, I'm doing fine. Tell my mom I'm fine."],
                                ['set', '@(pc).quest.status', 2]
                            ],[
                                ['dialog', "Hey there. Haven't seen you around the block before."]
                            ]
                        ] 
                }
            });
            daughter.tags.push('daughter');
            this.block.state.addEntity(daughter);

        }
    });

    var ExecuteEncounter = Encounter.extend({
        start: function(){
            //Create Mother
            var gangBossRoom = sge.random.item(this.block.rooms);
            var gangBoss = this.state.factory('gangboss', {
                xform: {
                    tx: gangBossRoom[0] * 32,
                    ty: gangBossRoom[1] * 32
                }
            });
            gangBoss.tags.push('gangboss');
            this.block.state.addEntity(gangBoss);
        }
    });

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
                        'layer0' : { srcX : 2, srcY: 0, spritesheet: 'future2'}
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
            
           
            
            this.state.daughter = null;
            
            /*
            for (var i=0;i<10;i++){
                this.createEnemy();
            }
            */
            
            elevator = this.state.factory('elevator',{xform:{
                tx:80,
                ty:112
            }});
            this.state.addEntity(elevator);

            encounter = new CheckupEncounter(this);
            new ExecuteEncounter(this);
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
                        tx: (6 + 0.5) * this.map.tileSize,
                        ty: (6 + 0.5) * this.map.tileSize,
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
        }
    });
    return LevelGenerator;
})
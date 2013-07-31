define([
	'sge/lib/class',
	'sge/lib/vector',
	'sge/lib/random'
],
function(Class, Vector2D, Random){
	var Room = Class.extend({
		init: function(gen, cx, cy, width, height, id){
			this.generator = gen;
			this.id = id;
			this.cx = cx;
			this.cy = cy;
			this.width = width;
			this.height = height;
			var halfWidth = Math.round((width - 1)/2);
			var halfHeight = Math.round((height - 1)/2);

			this.north = this.cy - halfHeight;
			this.south = this.cy + halfHeight;
			this.east = this.cx + halfWidth;
			this.west = this.cx - halfWidth;
		},
		plot : function(){

		},
		openDoors : function(){
			var dir = 'north';
			var potential = []
			for (var i=this.west;i<=this.east;i++){
				if ((i%2)!=1){
					continue;
				}
				if (this.generator.checkDirection(i, this.north-1, 'north', ['empty','room'])){
					potential.push([i, this.north-1]);
				}
			}
			for (i=this.west;i<=this.east;i++){
				if ((i%2)!=1){
					continue;
				}
				if (this.generator.checkDirection(i, this.south+1, 'south', ['empty','room'])){
					potential.push([i, this.south+1]);
				};
			}

			for (i=this.north;i<=this.south;i++){
				if ((i%2)!=1){
					continue;
				}
				if (this.generator.checkDirection(this.west-1, i, 'west', ['empty','room'])){
					potential.push([this.west-1, i]);
				}
			}
			for (i=this.north;i<=this.south;i++){
				if ((i%2)!=1){
					continue;
				}
				if (this.generator.checkDirection(this.east+1, i, 'east', ['empty','room'])){
					potential.push([this.east+1, i]);
				};
			}

			var nDoors = 1 + ((Math.random() > 0.75) ? 1 : 0)
			this.doors = [];
			shuffle(potential);
			while (this.doors.length < nDoors){
				if (potential.length!=0){
					var door = potential.shift();
					this.doors.push(door);
					this.generator.plot(door[0],door[1],'door');

				} else {
					break;
				}
			}
		}
	})

	//shuffles list in-place
	function shuffle(list) {
	  var i, j, t;
	  for (i = 1; i < list.length; i++) {
	    j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
	    if (j != i) {
	      t = list[i];                        // swap list[i] and list[j]
	      list[i] = list[j];
	      list[j] = t;
	    }
	  }
	}

	var DungeonGenerator = Class.extend({
		init: function(state){
			this.state = state;
			this.generate(this.state.map);
		},
		initMap : function(){
			this.data = [];
			_.each(this.map._tiles, function(tile){
				if ((tile.x===0) || (tile.y===0) || (tile.x==this.map.width-1) || (tile.y==this.map.height-1)){
					this.data.push('edge');
				} else {
					this.data.push('empty');
				}
                tile.passable = false;
                tile.layers['layer0'] = {srcX: 3, srcY: 0};
			}.bind(this));
		},
		generate: function(map){
			this.map = map;
			this.initMap();
			var diagonal = Math.sqrt(map.width * map.width + map.height * map.height);
			var roomCount = Math.round(diagonal*2);
			this.rooms = [];;
			var room = false;
			while (!room){
				var targetX = map.width / 2;
				var targetY = map.height / 2;
				var width = Random.rangeInt(0,2) * 2 + 3;
				var height = Random.rangeInt(0,2) * 2 + 3;
				room = this.placeRoom(targetX, targetY, width, height);
			}
			this.rooms.push(room);
			var dirs = ['north', 'south', 'east', 'west'];
			for (var i = dirs.length - 1; i >= 0; i--) {
				this.expandRoom(room,  dirs[i]);
			};
			var exit = Random.rangeInt(1, this.rooms.length);
			this.state.createStairs(this.rooms[exit].cx, this.rooms[exit].cy)
		},
		expandRoom : function(room, dir){
			var count = 0;
			var newRoom = null
			while ((!newRoom)&&(count<10)){
				count++;
				var w = Random.rangeInt(0,2) * 2 + 3;
				var h = Random.rangeInt(0,2) * 2 + 3;
				var halfw = (w - 1) / 2;
				var halfh = (h - 1) / 2;
				var cx = room.cy;
				var cy = room.cx;
				switch(dir){
					case 'north':
						cy = room.north - halfh - 1 - 1;
						cx = room.cx;
						break;

					case 'south':
						cy = room.south + halfh + 1 + 1;
						cx = room.cx;
						break;

					case 'west':
						cx = room.west - halfw - 1 - 1;
						cy = room.cy;
						break

					default:
						cx = room.east + halfw + 1 + 1;
						cy = room.cy;
						break
				}
				newRoom = this.placeRoom(cx, cy, w, h);
			}
			if (newRoom){
				this.rooms.push(newRoom);
				var dx = 0;
				var dy = 0;
				switch(dir){
					case 'north':
						dy = room.north - 1;
						dx = room.cx;
						break;

					case 'south':
						dy = room.south  + 1;
						dx = room.cx;
						break;

					case 'west':
						dx = room.west  - 1;
						dy = room.cy;
						break

					default:
						dx = room.east  + 1;
						dy = room.cy;
						break
				}
				this.plot(dx, dy,'door')
				var dirs = ['north', 'south', 'east', 'west'];
				shuffle(dirs);
				for (var i = dirs.length - 1; i >= 0; i--) {
					this.expandRoom(newRoom,  dirs[i]);
				};
			}
		},
		tunnel : function(x, y, dir){
			var coords = [];
			switch (dir){
				case 0:
					coords = [[x, y],[x+1, y],[x+2, y]];
					break;
				case 1:
					coords = [[x,y],[x,y+1],[x,y+2]];
					break;
				case 2:
					coords = [[x, y],[x+-1, y],[x-2, y]];
					break;
				case 3:
					coords = [[x,y],[x,y-1],[x,y-2]];
					break;
			}
			blocked = false;
			_.each(coords, function(coord){
				if ((coord[0]==x) && (coord[1]==y)){
					return;
				}
				var data=this.data[this.map.getIndex(coord[0], coord[1])];
				if((data==='empty') || (data=='door')|| (data=='perimeter')){
					blocked = false;
				} else {
					blocked = true;
				}
			}.bind(this));
			if (!blocked){
				_.each(coords, function(coord){
					var tile = this.map.getIndex(coord[0], coord[1]);
					this.plot(coord[0],coord[1],'hall');
				}.bind(this));
				var startX = coords[2][0];
				var startY = coords[2][1];
				var dirs = [0,1,2,3];
				if (Math.random() > 0.75){
					//shuffle(dirs);
				}
				for (var i=0;i<4;i++){
					var d = dirs.shift();
					this.tunnel(startX,startY,d);
				}
			}
		},

		placeRoom : function(rx, ry, width, height){
			var halfWidth = (width - 1) / 2;
			var halfHeight = (height - 1) / 2;
			//var rx = Math.round(((this.map.width-1)/2) * Math.random()) * 2 + 1;
			//var ry = Math.round(((this.map.width-1)/2) * Math.random()) * 2 + 1;
			var success = true;
			for (var y=-halfHeight;y<=halfHeight;y++){
				for (var x=-halfWidth;x<=halfWidth;x++){
					var data = this.data[this.map.getIndex(rx + x, ry + y)];
					if (data!='empty'){
						success = false;
						break;
					}
				}
				if (!success){
					break;
				}
			}
			if (!success){
				return false;
			}
			for (y=-halfHeight;y<=halfHeight;y++){
				for (x=-halfWidth;x<=halfWidth;x++){
					this.plot(rx+x,ry+y, 'room');
				}
			}
			perimeter=[];

			for (x=-halfWidth;x<=halfWidth;x++){
				this.plotData(rx+x,ry+halfHeight+1,'perimeter');
				this.plotData(rx+x,ry-halfHeight-1,'perimeter');
				perimeter.push([rx+x,ry+halfHeight+1])
				perimeter.push([rx+x,ry-halfHeight-1])
			}

			for (y=-halfHeight;y<=halfHeight;y++){
				this.plotData(rx+halfWidth+1,ry+y,'perimeter');
				this.plotData(rx-halfWidth-1,ry+y,'perimeter');
				perimeter.push([rx+halfWidth+1,ry+y])
				perimeter.push([rx-halfWidth-1,ry+y])
			}

			this.plotData(rx+halfWidth+1,ry+halfHeight+1,'perimeter');
			this.plotData(rx+halfWidth+1,ry-halfHeight-1,'perimeter');
			this.plotData(rx-halfWidth-1,ry+halfHeight+1,'perimeter');
			this.plotData(rx-halfWidth-1,ry-halfHeight-1,'perimeter');

			if (this.rooms.length > 1){
				var roll = Math.random();
				if (roll > 0.35){
					this.state.createEnemy(rx, ry);
					if (roll > 0.9){
						this.state.createEnemy(rx+1, ry);
					}
				}
			}


			return new Room(this, rx, ry, width, height, this.rooms.length);
		},
		checkDirection : function(dx, dy, dir, type){
			data = this.data[this.map.getIndex(dx + Vector2D.DIRECTION[dir].x, dy + Vector2D.DIRECTION[dir].y)];
			return (_.contains(type, data))
		},
		plotData : function(x, y, data){
			var tile = this.map.getTile(x, y);
            //tile.passable = false;
            //tile.layers['layer0'] = {srcX: 14, srcY: 8};
            this.data[this.map.getIndex(x,y)]=data;
		},
		plot : function(x, y, data){
			var tile = this.map.getTile(x, y);
			//console.log('plot',x ,y, this.rooms.length);
            tile.passable = true;
            tile.layers['layer0'] = {srcX: 14, srcY: 20};
            this.data[this.map.getIndex(x,y)]=data;
		}
	});
	return DungeonGenerator;
});

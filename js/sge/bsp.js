requirejs(['sge/lib/class'],
function  (Class) {
    BSPNode = Class.extend({
        init: function(x, y, w, h){
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        },
        split: function(horz, position){
            if (horz){
                var h1 = Math.round(this.height * position);
                var h2 = this.height - h1;
                var childA = new BSPNode(this.x, this.y, this.width, h1);
                var childB = new BSPNode(this.x, this.y + h1, this.width, h2);
            } else {
                var w1 = Math.round(this.width * position);
                var w2 = this.width - w1;
                var childA = new BSPNode(this.x, this.y, w1, this.height);
                var childB = new BSPNode(this.x + w1, this.y, w2, this.height);
            }
            childA.parent = this;
            childB.parent = this;
            this.children = [childA, childB];
            return this.children;
        },
        plot : function(map, x, y){
            var tile = map.getTile(x, y);
            tile.passable = true;
            tile.layers['layer0'] = {srcX: 14, srcY: 8};
        },
        room : function(map){
            console.log(this.x, this.y, this.width, this.height);
            for (var j = 1; j < this.height; j++) {
                for (var k = 1; k < this.width; k++) {
                    this.plot(map, this.x + k, this.y + j);
                };
            };
        },
        connect : function(map, node){
            var cx1 = this.x + Math.round(this.width / 2);
            var cy1 = this.y + Math.round(this.height / 2);

            var cx2 = node.x + Math.round(node.width / 2);
            var cy2 = node.y + Math.round(node.height / 2);

            console.log('Connect', cx1, cy1, cx2, cy2);

            this.line(map, cx1, cy1, cx2, cy2);

        },
        line: function(map, x0, y0, x1, y1){
           var dx = Math.abs(x1-x0);
           var dy = Math.abs(y1-y0);
           var sx = (x0 < x1) ? 1 : -1;
           var sy = (y0 < y1) ? 1 : -1;
           var err = dx-dy;

           while(true){
             this.plot(map, x0,y0);  // Do what you need to for this

             if ((x0==x1) && (y0==y1)) break;
             var e2 = 2*err;
             if (e2 >-dy){ err -= dy; x0  += sx; }
             if (e2 < dx){ err += dx; y0  += sy; }
           }
        }
    });

var root = new BSPNode(0, 0, size-1, size-1);
    var children = root.split(true, 0.5);
    var parents = children[0].split(false, 0.5);
    parents = parents.concat(children[1].split(false, 0.5));
    children = parents;
    parents = root.children;
    var j = 4;
    while(j>0){
        j--;
        var nextChildren = [];
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var horz = (Math.random() > 0.5);
            var size = Math.random();
            if (horz){
                if (child.height < 12){
                    nextChildren.push(child);
                    continue;
                }
                var newSize1 = Math.floor(child.height * size);
                var newSize2 = child.height - newSize1;
                while ((newSize1 < 4) || (newSize2 < 4)){
                    size = Math.random();
                    newSize1 = Math.floor(child.height * size);
                    newSize2 = child.height - newSize1;
                }
            } else {
                if (child.width < 12){
                    nextChildren.push(child);
                    continue;
                }
                var newSize1 = Math.floor(child.width * size);
                var newSize2 = child.width - newSize1;
                while ((newSize1 < 4) || (newSize2 < 4)){
                    size = Math.random();
                    newSize1 = Math.floor(child.width * size);
                    newSize2 = child.width - newSize1;
                }
            }
            var tmp = child.split(horz, size);
            nextChildren = nextChildren.concat(tmp);
        };
        parents = children;
        children = nextChildren;
    }
    _.each(children, function(node){node.room(map)});

    var nextset = []
    _.each(_.map(children,function(n){nextset.push(n.parent.parent); return n.parent}), function(node){node.children[0].connect(map, node.children[1])});
    //_.each(nextset, function(node){node.children[0].connect(map, node.children[1])});
    // HTML5 Canvas Renderer
});

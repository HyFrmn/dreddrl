define(['sge','../behaviour'],function(sge, Behaviour){
    var GotoBehaviour = Behaviour.Add('goto', {
        onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 256;
            this._timeout = -1;
            this._pathNavigation = false;
            this._beep = 0;
            this._avoidVector = null;
            this._onContact = this.onContact.bind(this);
            this.entity.addListener('contact.start', this._onContact);
        },

        onEnd: function(){
            this._super();
            this.entity.removeListener('contact.start', this._onContact);
        },

        onContact : function(entity){
            if (entity.get('chara')){
                this._beep = sge.random.range(0.2,0.6);
                var tx = this.entity.get('xform.tx');
                var ty = this.entity.get('xform.ty');

                var targetx = this.target.get('xform.tx');
                var targety = this.target.get('xform.ty');

                var deltax = targetx - tx;
                var deltay = targety - ty;
                var dist = Math.sqrt(deltax * deltax + deltay * deltay);
                var nx = deltax/dist;
                var ny = deltay/dist;
                this._avoidVector = [ny,nx];

            }
        },

        startNavigation: function(){
            var tx1 = this.entity.get('xform.tx');
            var ty1 = this.entity.get('xform.ty');
            var tileX = Math.floor(tx1/32);
            var tileY = Math.floor(ty1/32);
            var tx2 = this.target.get('xform.tx');
            var ty2 = this.target.get('xform.ty');
            var endTileX = Math.floor(tx2/32);
            var endTileY = Math.floor(ty2/32);
            this._pathPoints = this.state.map.getPath(tileX, tileY, endTileX, endTileY);
            if (this._pathPoints.length){
                this._pathNavigation = true;
            } else {
                this.fail();
            }
        },

        destination: function(){
            this.end();
        },

        tick: function(delta){
            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);
            var nx = deltax/dist;
            var ny = deltay/dist;

            var trace = this.state.map.traceStatic(tx, ty, targetx, targety);

            if (this.target.test){
                if (this.target.test(tx, ty, 16)){
                    this.destination()
                    return
                }
            } else {
                if (dist<64){
                    this.destination();
                    return
                }
            }

            if (this._pathNavigation){
                if (this._pathPoints.length<=0 || !trace[2]){
                    this._pathNavigation = false;
                }
                var goalX = this._pathPoints[0][0];
                var goalY = this._pathPoints[0][1];
                var dx = goalX - tx;
                var dy = goalY - ty;
                dist = Math.sqrt((dx*dx)+(dy*dy));
                if (dist<8){
                    this._pathPoints.shift();
                }
                nx = dx / dist;
                ny = dy / dist;
            } else {
                this.startNavigation();
            }
            if (this._beep>0){
                this._beep = this._beep - delta;
                nx = this._avoidVector[0];
                ny = this._avoidVector[1];
            }
            this.entity.set('movement.v', nx, ny);
        }
    })
})
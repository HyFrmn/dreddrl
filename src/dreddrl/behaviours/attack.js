define(['sge','../behaviour'],function(sge, Behaviour){
    var AttackBehaviour =  Behaviour.Add('attack', {
        onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 128;
            this._startTime = this.state.getTime();
            this.end();
        },

        tick: function(delta){
            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);

            if (Math.abs(deltax)<10||Math.abs(deltay)<10&&dist<this.dist){
                this.entity.fireEvent('weapon.fire');
            }
        }
    })

    var AttackOnSightBehaviour =  Behaviour.Add('attackonsight', {
        onStart: function(options){
            options = options || {};
            this.target = options.target;
            this.timeout = options.timeout || -1;
            this.dist = options.dist || 128;
            this._startTime = this.state.getTime();
            this.end();
        },

        tick: function(delta){
            var targetx = this.target.get('xform.tx');
            var targety = this.target.get('xform.ty');

            var tx = this.entity.get('xform.tx');
            var ty = this.entity.get('xform.ty');

            var deltax = targetx - tx;
            var deltay = targety - ty;
            var dist = Math.sqrt(deltax * deltax + deltay * deltay);

            if (dist<this.dist){
                this.setBehaviour('track+attack', {timeout: 1, target: this.target}).
                    then(this.parent.deferBehaviour('wait+attackonsight', {timeout: 1, target: this.target})).
                    then(this.parent.deferBehaviour('idle+attackonsight', {timeout: 1, target: this.target}));
            }
        }
    })
});
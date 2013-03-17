define(['sge'], function(sge){
    var Interact = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.fillStyle = 'green';
            this.data.strokeStyle = 'black';
            this.data.targets = data.targets || null;
            this.data.width = data.width || 32;
            this.data.height = data.height || 32;
            this.active = false;
            this.interact = this.interact.bind(this);
            this.entity.addListener('focus.gain', this.activate.bind(this));
            this.entity.addListener('focus.lose', this.deactivate.bind(this));
        },
        tick : function(){
        	var pc = this.getPC();
        	if (pc){
        		var data = this.getPCPosition();
        		if (data[4]<48){
        			pc.fireEvent('')
        		}
        	}
        },
        activate: function(coord){
            this.activeCoord = coord;
            this.active = true;
            console.log(this.entity.tags);
            this.state.input.addListener('keydown:enter', this.interact);
        },
        deactivate: function(){
            this.active = false;
            this.state.input.removeListener('keydown:enter', this.interact);
        },
        interact: function(){
            this.entity.fireEvent('interact');
        },
        getPC: function(){
            return this.entity.state.getEntitiesWithTag('pc')[0] || null;
        },
        getPCPosition: function(){
            var pc = this.getPC();
            var dx = this.entity.get('xform.tx') - pc.get('xform.tx');
            var dy = this.entity.get('xform.ty') - pc.get('xform.ty');
            var dist = Math.sqrt((dx*dx)+(dy*dy));
            return [pc, dx, dy, dist];
        },
        render : function(renderer, layer){
            if (this.active){
                var tx = this.entity.get('xform.tx');
                var ty = this.entity.get('xform.ty');
                var width = this.get('width'); //this.entity.get('physics.width');
                var height = this.get('height'); //this.entity.get('physics.height');
                renderer.drawRect(layer, tx - width/2, ty - height/2, width, height, {fillStyle: this.get('fillStyle'), strokeStyle: this.get('strokeStyle')})
            }
        },
        deregister: function(){
            this._super();
            this.state.input.removeListener('keydown:enter', this.interact);
        }
    });
    sge.Component.register('interact', Interact);
    return Interact
})
define(['sge'], function(sge){
    var Interact = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.fillStyle = 'green';
            this.data.strokeStyle = 'black';
            this.data.targets = data.targets || null;
            this.data.width = data.width || 32;
            this.data.height = data.height || 32;
            this.data.dist = data.dist || 96;
            this.active = false;
            this.interact = this.interact.bind(this);
            this.entity.addListener('focus.gain', this.activate.bind(this));
            this.entity.addListener('focus.lose', this.deactivate.bind(this));
        },
        activate: function(coord){
            this.activeCoord = coord;
            this.active = true;
            this.state.input.addListener('keydown:enter', this.interact);
        },
        deactivate: function(){
            this.active = false;
            this.state.input.removeListener('keydown:enter', this.interact);
        },
        interact: function(){
            this.entity.fireEvent('interact');
        },
        deregister: function(){
            this._super();
            this.state.input.removeListener('keydown:enter', this.interact);
        }
    });
    sge.Component.register('interact', Interact);
    return Interact
})
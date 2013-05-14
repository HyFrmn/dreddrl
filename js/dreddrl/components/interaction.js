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
            this.data.priority = data.priority || false;
            this.active = false;
            this.interact = this.interact.bind(this);
            this.entity.addListener('focus.gain', this.activate.bind(this));
            this.entity.addListener('focus.lose', this.deactivate.bind(this));
        },
        _set_priority : function(priority){
            this.data.priority = this.__set_value('priority', Boolean(priority));
            this.signalActor.setVisible(this.data.priority);
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
            var evt = 'interact';
            if (this.state.input.isPressed('alt')){
                evt = 'interact.secondary';
            }
            this.entity.fireEvent(evt, this.state.pc);
        },
        register: function(state){
            this._super(state);
            this.signalActor = new CAAT.Actor().setLocation(4,-36).setBackgroundImage(sge.Renderer.SPRITESHEETS['exclimation_icons']).setSpriteIndex(0);
            this.entity.get('xform').container.addChild(this.signalActor);
            this.signalActor.setVisible(this.data.priority);
        },
        deregister: function(state){
            if (this.get('priority')){
                this.entity.get('xform').container.removeChild(this.signalActor);
            }
            state.input.removeListener('keydown:enter', this.interact);
            this._super(state);
        }
    });
    sge.Component.register('interact', Interact);
    return Interact
})

define(['sge','../config'], function(sge, config){
    var ControlsComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.speed = 128;
            this.fire = function(){
                this.entity.fireEvent('fire');
            }.bind(this)
        },
        register: function(state){
            this.input = state.input;
            this.entity.state.input.addListener('keydown:' + config.fireButton, this.fire);
        },
        deregister: function(state){
            this.input = undefined;
            this.entity.state.input.removeListener('keydown:' + config.fireButton, this.fire);
        },
        tick : function(){
            if (this.input===undefined){
                return;
            }
            var xaxis = 0;
            var yaxis = 0;
            if (this.input.isPressed('down') || this.input.isPressed('S')){
                yaxis++;
            }
            if (this.input.isPressed('up') || this.input.isPressed('W')){
                yaxis--;
            }
            if (this.input.isPressed('right') || this.input.isPressed('D')){
                xaxis++;
            }
            if (this.input.isPressed('left') || this.input.isPressed('A')){
                xaxis--;
            }
            this.entity.set('xform.vx', xaxis * this.data.speed);
            this.entity.set('xform.vy', yaxis * this.data.speed);
        }
    });
    sge.Component.register('judge.controls', ControlsComponent);
    return ControlsComponent;
});

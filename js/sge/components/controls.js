define(['sge/component'], function(Component){
    var ControlsComponent = Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.speed = 128;
        },
        register: function(state){
            this.input = state.input;
        },
        deregister: function(state){
            this.input = undefined;
        },
        tick : function(){
            if (this.input===undefined){
                return;
            }
            var xaxis = 0;
            var yaxis = 0;
            if (this.input.isPressed('down') || this.input.isPressed('S') || this.input.joystick.down()){
                yaxis++;
            }
            if (this.input.isPressed('up') || this.input.isPressed('W') || this.input.joystick.up()){
                yaxis--;
            }
            if (this.input.isPressed('right') || this.input.isPressed('D') || this.input.joystick.right()){
                xaxis++;
            }
            if (this.input.isPressed('left') || this.input.isPressed('A') || this.input.joystick.left()){
                xaxis--;
            }
            this.entity.set('xform.vx', xaxis * this.data.speed);
            this.entity.set('xform.vy', yaxis * this.data.speed);
        }
    });
    Component.register('controls', ControlsComponent);
    return ControlsComponent;
});

define(['sge','../config'], function(sge, config){
    var ControlsComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.speed = 128;
            this.fire = function(){
                this.entity.fireEvent('weapon.fire');
            }.bind(this);
            this.switchWeapon = function(){
                this.entity.fireEvent('weapon.switch');
            }.bind(this);
        },
        register: function(state){
            this.input = state.input;
            this.entity.state.input.addListener('keydown:' + config.fireButton, this.fire);
            this.entity.state.input.addListener('tap', this.fire);
            this.entity.state.input.addListener('keydown:W', this.switchWeapon);
        },
        deregister: function(state){
            this.input = undefined;
            this.entity.state.input.removeListener('keydown:' + config.fireButton, this.fire);
            this.entity.state.input.removeListener('tap', this.fire);
            this.entity.state.input.removeListener('keydown:W' , this.switchWeapon);
        },
        tick : function(){
            if (this.input===undefined){
                return;
            }
            var xaxis = 0;
            var yaxis = 0;
            var strafe = false;
            if (this.input.isPressed('down') || this.input.joystick.down()){
                yaxis++;
            }
            if (this.input.isPressed('up') || this.input.joystick.up()){
                yaxis--;
            }
            if (this.input.isPressed('right') || this.input.joystick.right()){
                xaxis++;
            }
            if (this.input.isPressed('left') || this.input.joystick.left()){
                xaxis--;
            }
            if (this.input.isPressed('Z')){
                strafe=true;
            }
            var vx = vy = 0
            if (xaxis!=0||yaxis!=0){
                dist = Math.sqrt(xaxis*xaxis+yaxis*yaxis);
                vx = xaxis / dist;
                vy = yaxis / dist;
            }
            this.entity.set('movement.vx', vx);
            this.entity.set('movement.vy', vy);
            this.entity.set('movement.strafe', strafe);
        }
    });
    sge.Component.register('judge.controls', ControlsComponent);
    return ControlsComponent;
});

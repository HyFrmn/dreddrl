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
            this.entity.state.input.addListener('keydown:W', this.switchWeapon);
        },
        deregister: function(state){
            this.input = undefined;
            this.entity.state.input.removeListener('keydown:' + config.fireButton, this.fire);
            this.entity.state.input.removeListener('keydown:W' , this.switchWeapon);
        },
        tick : function(){
            if (this.input===undefined){
                return;
            }
            var xaxis = 0;
            var yaxis = 0;
            if (this.input.isPressed('down')){
                yaxis++;
            }
            if (this.input.isPressed('up')){
                yaxis--;
            }
            if (this.input.isPressed('right')){
                xaxis++;
            }
            if (this.input.isPressed('left')){
                xaxis--;
            }
            this.entity.set('xform.vx', xaxis * this.data.speed);
            this.entity.set('xform.vy', yaxis * this.data.speed);
        }
    });
    sge.Component.register('judge.controls', ControlsComponent);
    return ControlsComponent;
});

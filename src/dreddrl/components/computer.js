define(['sge'], function(sge){
    var ComputerComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.on = data.on==undefined ? false : data.on;
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact.bind(this));
        },
        interact: function(){
            if (this.get('on')){
                this.turnOff()
            } else {
                this.turnOn();
            }
        },
        turnOn: function(){
            this.set('on', true);
            this.entity.set('anim.anim', 'on');
            this.entity.set('anim.play', true);
        },
        turnOff: function(){
            this.set('on', false)
            this.entity.set('anim.anim', 'off');
            this.entity.set('anim.play', true);
        }
    });
    sge.Component.register('computer', ComputerComponent);
    return ComputerComponent
})

define(['sge', '../cutscene'], function(sge, Cutscene){
    var when = sge.vendor.when;
    var whenEntityEvent = function(entity, eventName){
        var deferred = when.defer();
        var listener = function(){
            entity.removeListener(eventName, listener);
            deferred.resolve();
        }
        entity.addListener(eventName, listener);
        return deferred.promise;
    }

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
            whenEntityEvent(this.entity, 'anim.complete').then(this._startCutscene.bind(this))
        },
        turnOff: function(){
            this.set('on', false)
            this.entity.set('anim.anim', 'off');
            this.entity.set('anim.play', true);
        },
        _startCutscene: function(){
            console.log('Computer Cutscene', Cutscene);
            //this.state.game.fsm.startCutscene();
            var cutscene = new Cutscene(this.entity.state.game._states.cutscene);
            
            cutscene.addAction('computer.message', 'Network Error: Cannot connect to server.')
            cutscene.play().then(this.turnOff.bind(this))

        }
    });
    sge.Component.register('computer', ComputerComponent);
    return ComputerComponent
})

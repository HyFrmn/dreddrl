define(['sge'], function(sge){
    var Elevator = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.up = Boolean(data.up);
            this.interact = this.interact.bind(this);
            this.entity.addListener('interact', this.interact.bind(this));
            this.entity.addListener('focus.gain', this.open.bind(this));
            this.entity.addListener('focus.lose', this.close.bind(this));
        },
        interact: function(){
            this.state.loadLevel("station");
            /*
            if (this.state.loadLevel(this.get('up'))){

            } else {

            }
            */
        },
        open: function(){
            this.entity.set('anim.anim', 'open');
            this.entity.set('anim.play', true);
        },
        close: function(){
            this.entity.set('anim.anim', 'close');
            this.entity.set('anim.play', true);
        },
    	register: function(state){
            this._super(state);
            this.map = state.map;
            this.elevatorActor = new CAAT.ActorContainer().
                                        setBackgroundImage(sge.Renderer.SPRITESHEETS['elevator']).
                                        setSpriteIndex(0).
                                        setLocation(-48, -64);
            //this.entity.get('xform.container').addChild(this.elevatorActor);
            
		},
    });
    sge.Component.register('elevator', Elevator);
    return Elevator
})

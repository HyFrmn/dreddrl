define(['sge', '../config'], function(sge, config){
    var Chara = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.fillStyle = 'orange';
            this.data.strokeStyle = 'black';
            this.data.radius = 32;
            this.entity.addListener('highlight.on', this.onHighlightOn.bind(this));
            this.entity.addListener('highlight.off', this.onHighlightOff.bind(this));
        },
        onHighlightOff: function(){
            this._hightlight_actor.setVisible(false);
        },
        onHighlightOn: function(){
            this._hightlight_actor.setVisible(true);
        },
        register: function(state){
            this._super(state);
            this._hightlight_actor = new CAAT.ShapeActor().
                                        setFillStyle(this.get('fillStyle')).
                                        setStrokeStyle(this.get('strokeStyle')).
                                        setShape(CAAT.ShapeActor.SHAPE_CIRCLE).
                                        setSize(24,24).
                                        setVisible(false).
                                        setPosition(4,4);
            this.entity.get('xform').container.addChild(this._hightlight_actor);
        },
        deregister: function(state){
            if (this.get('priority')){
                this.entity.get('xform').container.removeChild(this._hightlight_actor);
            }
            this._super(state);
        }
    });
    sge.Component.register('chara', Chara);
    return Chara
})

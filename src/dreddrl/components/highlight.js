define(['sge', '../config'], function(sge, config){
    var Highlight = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.color = data.fillStyle || 'orange';
            this.data.border = data.fillStyle || 'black';
            this.data.radius = data.radius || 32;
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
                                        setFillStyle(this.get('color')).
                                        setStrokeStyle(this.get('border')).
                                        setShape(CAAT.ShapeActor.SHAPE_CIRCLE).
                                        setSize(this.get('radius'),this.get('radius')).
                                        setVisible(false).
                                        setPosition((32-this.get('radius'))/2,(32-this.get('radius'))/2);
            this.entity.get('xform').container.addChild(this._hightlight_actor);
        },
        _set_color: function(value, method){
            value = this.__set_value('color', value, method);
            if (this._hightlight_actor){
                console.log('C', value);
                this._hightlight_actor.setFillStyle(value);
            }
        },
        deregister: function(state){
            if (this.get('priority')){
                this.entity.get('xform').container.removeChild(this._hightlight_actor);
            }
            this._super(state);
        }
    });
    sge.Component.register('highlight', Highlight);
    return Highlight
})

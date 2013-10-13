define(['sge', '../config'], function(sge, config){
    var Highlight = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.color = data.fillStyle || 'orange';
            this.data.border = data.fillStyle || 'black';
            this.data.radius = data.radius || 16;
            this._focus = false;
            this._highlight = false;

            this._highlightActors=[];

            this.entity.addListener('highlight.on', this.onHighlightOn.bind(this));
            this.entity.addListener('highlight.off', this.onHighlightOff.bind(this));
            this.entity.addListener('focus.gain', this.onFocusGain.bind(this));
            this.entity.addListener('focus.lose', this.onFocusLose.bind(this));
        },
        onHighlightOff: function(){
            this._highlight = false;
            this._updateVisibility();
        },
        onHighlightOn: function(){
            this._highlight = true;
            this._updateVisibility();
            
        },
        onFocusGain: function(){
            this._focus = true;
            this._updateVisibility();
        },
        onFocusLose: function(){
            this._focus = false;
            this._updateVisibility();
            
        },
        _updateVisibility: function(){
            if (this._focus){
                for (var i = this._highlightActors.length - 1; i >= 0; i--) {
                    this._highlightActors[i].setFillStyle('lime');
                    this._highlightActors[i].setVisible(true);
                };
            } else if (this._highlight){
                for (var i = this._highlightActors.length - 1; i >= 0; i--) {
                    this._highlightActors[i].setFillStyle(this.get('color'));
                    this._highlightActors[i].setVisible(true);
                };
            } else {
                for (var i = this._highlightActors.length - 1; i >= 0; i--) {
                    this._highlightActors[i].setVisible(false);
                };
            }
        },
        register: function(state){
            this._super(state);
            this._highlightContainer = new CAAT.ActorContainer();
            var targets = [[0,0]];
            if (this.entity.get('interact')){
                var interactTargets = this.entity.get('interact.targets');
                if (interactTargets!=null){
                    targets=interactTargets;
                }
            }
            for (var i = targets.length - 1; i >= 0; i--) {
                var target = targets[i];
                var highlightActor = new CAAT.ShapeActor().
                                        setFillStyle(this.get('color')).
                                        setStrokeStyle(this.get('border')).
                                        setShape(CAAT.ShapeActor.SHAPE_CIRCLE).
                                        setSize(this.get('radius')*2,this.get('radius')*2).
                                        setVisible(false).
                                        setPosition(target[0]-this.get('radius'),target[1]-this.get('radius'));
                this._highlightActors.push(highlightActor);
                this._highlightContainer.addChild(highlightActor);
            };
            this.state.map.highlightContainer.addChild(this._highlightContainer);
            this._highlightContainer.setPosition(this.entity.get('xform.tx'),this.entity.get('xform.ty'));
            this.entity.addListener('xform.move', function(){
                this._highlightContainer.setPosition(this.entity.get('xform.tx'),this.entity.get('xform.ty'));
            }.bind(this));
        },
        _set_color: function(value, method){
            value = this.__set_value('color', value, method);
            if (this._highlight_actor){
                console.log('C', value);
                this._highlight_actor.setFillStyle(value);
            }
        },
        deregister: function(state){
            if (this.get('priority')){
                this.entity.get('xform').container.removeChild(this._highlight_actor);
            }
            this._super(state);
        }
    });
    sge.Component.register('highlight', Highlight);
    return Highlight
})

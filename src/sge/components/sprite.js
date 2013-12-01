define(['sge/component', 'sge/spritesheet', 'sge/config', 'sge/renderer'], function(Component, SpriteSheet, config, Renderer){
    var SpriteComponent = Component.extend({
        init : function(entity, data){
            this._super(entity, data)
            this.data.frame = parseInt(data.frame || 0);
            this.data.scale = data.scale || 1;
            this.data.mirror = true;
            this.data.offsetX = data.offsetX || 0;
            this.data.offsetY = data.offsetY || 0;
            var subpath = data.src.split('/');
            var name = subpath[subpath.length-1].split('.')[0];
            this.spriteSheet = Renderer.SPRITESHEETS[name];
            //new SpriteSheet(config.baseUrl + data.src, data.width, data.height);
            //*
            this.tintCallback = function(color, length){
                if (color){
                    this.setBackground(name + '_tint_' + color);
                } else{
                    this.setBackground(name);
                }
                if (length>0){
                    var timer = this.entity.state.createTimeout(length, function(){
                        this.setBackground(name);
                    }.bind(this));
                }
            }.bind(this);
            this.entity.addListener('sprite.tint', this.tintCallback);
            //*/
        },
        setBackground: function(name){
            var spriteSheet =  Renderer.SPRITESHEETS[name];
            this.actor.setBackgroundImage(spriteSheet);
        },
        register: function(state){
            this._super(state);
            this.actor = new CAAT.Actor().
                    setLocation(this.get('offsetX'),this.get('offsetY')).
                    setBackgroundImage(this.spriteSheet).
                    setSpriteIndex( 0 )
            this.entity.get('xform.container').addChild(this.actor);
        },
        deregister: function(state){
            this.entity.get('xform.container').removeChild(this.actor);
            this._super(state);
        },
        
        render : function(renderer, layer){
            this.actor.setSpriteIndex(this.get('frame'));
        }
            
    });
    Component.register('sprite', SpriteComponent);
    return SpriteComponent;
});

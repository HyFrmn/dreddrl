define(['sge'],function(sge){

    var BulletComponent = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this._broadcastCounter = 0;
            this.kill = this.kill.bind(this);
            this.hit = this.hit.bind(this);
            this.entity.tags.push('bullet');
        },
        hit: function(){
            console.log('Hit');
        },
        kill: function(){
            this.entity.fireEvent('kill');
        },
        register: function(state){
            this._super(state);
            this.entity.addListener('contact.tile', this.kill);
            this.scene = this.state.scene;
            this.container = new CAAT.ActorContainer().setLocation(12,12);
            var sizeX = 4;
            var sizeY = 24;
            if (Math.abs(this.entity.get('xform.vx')) > Math.abs(this.entity.get('xform.vy'))){
                sizeX = 24;
                sizeY = 4;
            }
            this.actor = new CAAT.Actor().setSize(sizeX,sizeY).setFillStyle('blue').setLocation(0,0);
            this.container.addChild(this.actor);
            this.entity.get('xform.container').addChild(this.container);
        },
        deregister: function(state){
            this.entity.removeListener('contact.tile', this.kill);
            this.entity.get('xform.container').removeChild(this.container);
            this._super(state);
        },
        tick: function(delta){
          if (!this._broadcastCounter--){
                this._broadcastCounter = 3;
                var tx = this.entity.get('xform.tx');
                var ty = this.entity.get('xform.ty');
                var entities = this.state.findEntities(tx, ty, 128);
                _.each(entities, function(e){
                    e.fireEvent('hear.distress', tx, ty);
                })
          }
        }
    });
    sge.Component.register('bullet', BulletComponent);
    return BulletComponent;
})      

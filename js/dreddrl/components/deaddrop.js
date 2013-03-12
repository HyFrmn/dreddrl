define(['sge'], function(sge){
    var DeadDrop = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.drop = this.drop.bind(this);
            this.entity.addListener('kill', this.drop);
        },
        drop: function(){
            var newItem = new sge.Entity({
                xform: {
    				tx: this.entity.get('xform.tx')+32,
					ty: this.entity.get('xform.ty')+32,
				},
                physics: {},
                sprite : {
                        src : 'assets/sprites/hunk.png',
                        width: 32,
                        offsetY: 0,
                        scale: 2
                    },
            });
            this.state.addEntity(newItem);
            console.log(newItem);
        },
    	register: function(state){
			this.state = state;
		},
		unregister: function(){
			this.state = null;
		}
    });
    sge.Component.register('deaddrop', DeadDrop);
    return DeadDrop
})
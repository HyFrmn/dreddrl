define(['sge', './blocklevelgenerator', './physics', './factory'], function(sge, BlockLevelGenerator, Physics, Factory){

	var DreddRLState = sge.GameState.extend({
		initState: function(options){
            // Tile Map
            var size = 64;
            this.options = options || {};
            this._contactList = [];

            this._killList = [];
            this.factory = Factory;
            this.initUi();
            this.map = new sge.Map(size,size,{src: 'assets/tiles/future2.png'});
            this.game.renderer.createLayer('base');
            this.game.renderer.createLayer('main');
            this.game.renderer.createLayer('canopy');
            // Load Game "Plugins"
            this.level = new BlockLevelGenerator(this, options);
            this.physics = new Physics(this);
            this.loader = new sge.vendor.PxLoader();
            this.loader.addCompletionListener(this.game.fsm.finishLoad.bind(this.game.fsm));
            this.loader.addProgressListener(this.progressListener.bind(this));
            this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future2.png');
            this.loader.addImage(sge.config.baseUrl + 'assets/sprites/hunk.png');
            this.loader.addImage(sge.config.baseUrl + 'assets/sprites/scifi_icons_1.png');
            
            

            /* Bound Events */
            this.pause = function(){
                this.game.fsm.pause()
            }.bind(this);

            this.toggleShadows = function(){
                this.shadows.toggle()
            }.bind(this);

            this.loader.start();
        },

        progressListener : function(e){
            sge.SpriteSheet.SpriteSheetImages[e.resource.getName()] == e.resource.img
            console.log(e.resource.getName(), e);
        },

        startState : function(){
            this.input.addListener('keydown:space', this.pause);
            //this.input.addListener('keydown:F', this.toggleShadows);
        },
        endState : function(){
            this.input.removeListener('keydown:space', this.pause)
            //this.input.removeListener('keydown:F', this.toggleShadows)        
        },
        addEntity: function(entity){
            this._super(entity);
            entity.addListener('kill', function(){
                    this._killList.push(entity);
            }.bind(this));
        },
        initUi : function(){
            this._elem_ammo = $('span.ammo');
        },
        updateUi : function(){
            if (this.pc){
                this._elem_ammo.text(this.pc.get('inventory.ammo'));
            }
        },
        tick : function(delta){
            this.tickTimeouts(delta);
            this.physics.resolveCollisions(delta);
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                entity.componentCall('tick', delta);
            }.bind(this));
            _.each(this._killList, function(e){
                this.removeEntity(e);
            }.bind(this))

            if (this.getEntitiesWithTag('pc').length<=0){
                this.game.fsm.gameOver();
            }

            if (this.getEntitiesWithTag('enemy').length<=0){
                this.game.fsm.gameWin();
            }

            this.game.renderer.track(this.pc);
            //this.shadows.tick(this.pc.get('xform.tx'),this.pc.get('xform.ty'));
            this.map.render(this.game.renderer);
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                var tx = entity.get('xform.tx');
                var ty = entity.get('xform.ty');
                var tile = this.map.getTile(Math.floor(tx / 32), Math.floor(ty / 32));
                if (tile.fade<1){
                    entity.componentCall('render', this.game.renderer, 'main');
                }
            }.bind(this));
            this.updateUi();
        
        },
        _paused_tick : function(delta){
            this.game.renderer.track(this.pc);
            this.map.render(this.game.renderer);
            _.each(this._entity_ids, function(id){
                var entity = this.entities[id];
                entity.componentCall('render', this.game.renderer, 'main');
            }.bind(this))
        },
	})

	return DreddRLState;
})
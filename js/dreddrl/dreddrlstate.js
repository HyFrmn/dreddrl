define(['sge', './blocklevelgenerator', './physics', './factory'], function(sge, BlockLevelGenerator, Physics, Factory){

    INTRO = "Welcome Rookie\nYou've been assigned to the homicide reported at Peach Trees in Sector 13.\nYou are the law.";

	var DreddRLState = sge.GameState.extend({
		initState: function(options){
            // Tile Map
            var size = 64;
            this.options = options || {};
            this._contactList = [];

            this._intro = false;

            this._killList = [];
            this.factory = Factory;
            this.initUi();
            this.map = new sge.Map(size,size,{src: 'assets/tiles/future2.png'});
            this.game.renderer.createLayer('base');
            this.game.renderer.createLayer('main');
            this.game.renderer.createLayer('canopy');
            // Load Game "Plugins"
            this.physics = new Physics(this);
            this.loader = new sge.vendor.PxLoader();
            this.loader.addProgressListener(this.progressListener.bind(this));
            this.loader.addImage(sge.config.baseUrl + 'assets/tiles/future2.png');
            this.loader.addImage(sge.config.baseUrl + 'assets/sprites/hunk.png');
            this.loader.addImage(sge.config.baseUrl + 'assets/sprites/albert.png');
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

        initGame : function(){
            this.level = new BlockLevelGenerator(this, this.options);
            setTimeout(function() {
                    this.game.fsm.finishLoad();
            }.bind(this), 1000);
        },

        progressListener : function(e){
            sge.SpriteSheet.SpriteSheetImages[e.resource.getName()] = e.resource.img;
            if (e.completedCount == e.totalCount){
                this.initGame();
            }
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
            this._elem_health = $('span.health');
        },
        updateUi : function(){
            if (this.pc){
                this._elem_ammo.text(this.pc.get('inventory.ammo'));
                this._elem_health.text(this.pc.get('health.life'));
            }
        },
        _interaction_tick : function(delta){

            var closest = null;
            var cdist = 64;
            var entities = this.getEntitiesWithComponent('interact');
            
            for (var i = entities.length - 1; i >= 0; i--) {
                entity = entities[i];
                var dx = entity.get('xform.tx') - this.pc.get('xform.tx');
                var dy = entity.get('xform.ty') - this.pc.get('xform.ty');
                var dist = Math.sqrt((dx*dx)+(dy*dy));
                if (dist < cdist){
                    closest = entity;
                    cdist = dist;
                }
            }
            if (closest!=this._closest){
                if (this._closest){
                    this._closest.fireEvent('focus.lose');
                }
                if (closest){
                    closest.fireEvent('focus.gain');
                }
                this._closest = closest;
            }
        },
        startDialog: function(dialog){
            this.game._states['dialog'].setDialog(dialog);
            this.game.fsm.startDialog();
            console.log('DIALOG');
        },
        tick : function(delta){
            this.tickTimeouts(delta);
            this.physics.resolveCollisions(delta);
            if (this._intro==false){
                this._intro = true;
                this.startDialog(INTRO)
            }
            this._interaction_tick(delta);
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

            /*
            if (this.getEntitiesWithTag('enemy').length<=0){
                this.game.fsm.gameWin();
            }
            */

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
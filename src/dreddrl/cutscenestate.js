define(['sge', './expr', './config'], function(sge, Expr, config){
    var when = sge.vendor.when;


    var CutsceneState = sge.GameState.extend({
        initState: function(){
            //Keep main game state visible. 
            this._keepScene = true;

            //A list of active entities.
            this._activeEntities = [];

            this.endScene = function(){
                console.log('End Scene')
                this.game.fsm.endCutscene();
            }.bind(this);

            //Create some basic interaction to advance the cutscene.
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:' + config.AButton, this.interact);
            this.input.addListener('keydown:' + config.BButton, this.interact);
        },
        navToEntity : function(entity, target){
            var deferred = when.defer();
            this._activeEntities.push(entity);
            entity.get('navigate').navToEntity(target, function(){
                var idx = this._activeEntities.indexOf(entity);
                this._activeEntities.splice(idx,1);
                deferred.resolve(entity, target);
            }.bind(this));
            return deferred.promise;
        },
        _testScene : function(){
            var pc = this.game._states['game'].pc;
            var citizen = this.game._states['game'].getEntitiesWithTag('shopper')[0];
            citizen.set('highlight.fillStyle','blue');
            citizen.fireEvent('highlight.on');
            this.navToEntity(citizen, pc).then(this.endScene).then(function(){
                citizen.fireEvent('highlight.off');
            });
            console.log('Start Test');
        },
        startState : function(){
            //this.interact();
            var state = this.game._states['game'];
            
            //Disable HUD
            state._uiContainer.setVisible(false);
            
            //Grab scene from main game and add our own container. Needs to be removed on clean up.
            this.scene = state.scene;

            this._super();

            this._testScene();
        },
        endState : function(){
            var state = this.game._states['game'];

            //Enable HUD
            state._uiContainer.setVisible(true);

            //Remove Custom UI Container.
            this.scene.removeChild(this.container);

            this.scene = null;
            this._super();
        },
        interact: function(){
            console.log('Interact with cutscene.')
        },
        tick: function(delta){
            //this.game._states['game'].tick(delta);
            this._activeEntities.forEach(function(entity){
                entity.componentCall('updateNavigation');
            })
            this.game._states['game'].physics.resolveCollisions(delta, this._activeEntities);
            this._activeEntities.forEach(function(entity){
                entity.componentCall('render');

            })
        }
    });
    return CutsceneState;
})

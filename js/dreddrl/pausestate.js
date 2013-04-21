define(['sge'], function(sge){
	var PauseState = sge.GameState.extend({
        initState: function(){
            this._keepScene = true;
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            var title = new CAAT.TextActor().setText('Paused').setFont('64px sans-serif').setTextAlign('center').setLocation(width/2,height/2 - 32);
            this.container.addChild(new CAAT.Actor().setSize(width,height).setFillStyle('black').setAlpha(0.5));
            this.container.addChild(title);
            this.unpause = function(){
                this.game.fsm.unpause();
            }.bind(this);
            this.input.addListener('keydown:space', this.unpause);
            this.input.addListener('tap', this.unpause);
        },
        startState : function(){
            var state = this.game._states['game'];
            this.scene = state.scene;
            this.scene.addChild(this.container);
            this._super();
        },
        endState : function(){
            this.scene.removeChild(this.container);
            this.scene = null;
            this._super();
        },
        tick : function(delta){
            func = this.game._states['game']._paused_tick;
            if (func){
                func.call(this.game._states['game'], delta);
            }
        }
    });
    return PauseState
})
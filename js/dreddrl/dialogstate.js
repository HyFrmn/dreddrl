define(['sge', './config'], function(sge, config){
	var DialogState = sge.GameState.extend({
		initState: function(){
            this._keepScene = true;
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            this.dialogContainer = new CAAT.ActorContainer().setLocation(16, height/2 - 32);
            this.container.addChild(new CAAT.Actor().setSize(width,height).setFillStyle('black').setAlpha(0.5));
            var instruct = new CAAT.TextActor().setText('Press Space to Continue').setFont('16px sans-serif').setTextAlign('right').setLocation(width-32,height-32);
            this.container.addChild(instruct);
            this.container.addChild(this.dialogContainer);
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:' + config.dialogButton, this.interact);
        },
        startState : function(){
            var state = this.game._states['game'];
            state._uiContainer.setVisible(false);
            this.scene = state.scene;
            this.scene.addChild(this.container);
            this._super();
        },
        endState : function(){
            var state = this.game._states['game'];
            state._uiContainer.setVisible(true);
            this.scene.removeChild(this.container);
            this.scene = null;
            this._super();
        },
        interact: function(){
            this.game.fsm.endDialog();        	
        },
		tick: function(){
			this.game._states['game']._paused_tick();
		},
		setDialog: function(dialog){
            this.dialog = dialog;
            this.dialogContainer.stopCacheAsBitmap();
            this.dialogContainer.emptyChildren();
            var chunks = dialog.split(' ');
            var count = chunks.length;
            var start = 0;
            var end = 0;
            var actor = new CAAT.TextActor().setFont('24px sans-serif');
            var y = 0;
            var testWidth = this.game.renderer.width - 64;
            while (end<=count){
                var test = chunks.slice(start, end).join(' ');
                actor.setText(test);
                actor.calcTextSize(this.game.renderer);
                if (actor.textWidth > (testWidth)){
                    end--;
                    actor.setLocation(16,y).setText(chunks.slice(start, end).join(' '));
                    this.dialogContainer.addChild(actor);
                    y+=24;
                    start = end;
                    end = start + 1;
                    actor = new CAAT.TextActor().setFont('24px sans-serif');
                } else {
                    end++;
                }
            }
            actor.setLocation(16,y);
            this.dialogContainer.addChild(actor);
            this.dialogContainer.setLocation(16, this.game.renderer.height - (y+96));
            this.dialogContainer.cacheAsBitmap();
		}
	});
	return DialogState;
})
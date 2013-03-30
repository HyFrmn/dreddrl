define(['sge'], function(sge){
	var DialogState = sge.GameState.extend({
		initState: function(){
            this.elem = $('.dialogscreen') || null;
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:enter', this.interact);
        },
        startState : function(){
            this._super();
            if (this.elem){
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this._super();
        },
        interact: function(){
            if (this.elem){
                this.elem.fadeOut(400, function(){
                    this.game.fsm.endDialog();
                }.bind(this));
            }
        	
        },
		tick: function(){
			this.game._states['game']._paused_tick();
		},
		setDialog: function(dialog){
			this.dialog = dialog;
            this.elem.find('.dialogbox .content').html(this.dialog.replace('\n', '<br/>'));
		}
	});
	return DialogState;
})
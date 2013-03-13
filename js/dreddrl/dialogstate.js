define(['sge'], function(sge){
	var DialogState = sge.GameState.extend({
		initState: function(){
            this.elem = $('.dialogscreen') || null;
            this.interact = this.interact.bind(this);
        },
        startState : function(){
            this.input.addListener('keydown:enter', this.interact);
            if (this.elem){
            	this.elem.find('.dialogbox').html(this.dialog.replace('\n', '<br/>'));
                this.elem.fadeIn();
            }
        },
        endState : function(){
            this.input.removeListener('keydown:enter', this.interact);
            if (this.elem){
                this.elem.fadeOut();
            }
        },
        interact: function(){
        	this.game.fsm.endDialog();
        },
		tick: function(){
			this.game._states['game']._paused_tick();
		},
		setDialog: function(dialog){
			this.dialog = dialog;
		}
	});
	return DialogState;
})
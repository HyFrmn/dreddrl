define(['sge'], function(sge){
	var DialogState = sge.GameState.extend({
		initState: function(){
            this.elem = $('.dialogscreen') || null;
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:enter', this.interact);
        },
        startState : function(){
            this._super();
        },
        endState : function(){
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
            this.elem.find('.dialogbox .content').html(this.dialog.replace('\n', '<br/>'));
		}
	});
	return DialogState;
})
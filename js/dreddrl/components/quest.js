define(['sge'],function(sge){

	var QuestComponent = sge.Component.extend({
		init: function(entity, data){
			this._super(entity, data);
			this.data.status = 0;
			this.data.total = 3;
		},
		tick: function(delta){
			if (this.get('status')>=(this.get('total'))){
				this.state.game.fsm.gameWin();
			}
		}
	})
	sge.Component.register('quest', QuestComponent);
    return QuestComponent;
})		
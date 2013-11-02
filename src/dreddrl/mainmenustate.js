define(['sge', './config'], function(sge, config){
	var MainMenuState = sge.GameState.extend({
		initState: function(){
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            var title = new CAAT.TextActor().setText('Justice in Mega City').setFont('64px sans-serif').setAlign('center').setLocation(width/2,height/2 - 32);
            var start = new CAAT.TextActor().setText('Start Game').setFont('32px sans-serif').setAlign('center').setLocation(width/2,height/2 + 36);
            var settings = new CAAT.TextActor().setText('Settings').setFont('32px sans-serif').setAlign('center').setLocation(width/2,height/2 + 72);
            var credits = new CAAT.TextActor().setText('Credits').setFont('32px sans-serif').setAlign('center').setLocation(width/2,height/2 + 108);
            var instruct = new CAAT.TextActor().setText('Press Enter to Select. Use arrows to change selection.').setFont('16px sans-serif')
            this.scene.addChild(title);
            this.scene.addChild(start);
            this.scene.addChild(settings);
            this.scene.addChild(credits);
            this.scene.addChild(instruct);
            this.itemActors = [start, settings, credits];
            this.itemCallbacks = [this.startGame.bind(this),]
            this.startState();

            this.input.addListener('keydown:enter', this.select.bind(this));
            this.input.addListener('tap', this.select.bind(this));
            this.input.addListener('keydown:down', function(){
                var index = this.selectedIndex + 1;
                if (index>=this.itemActors.length) {
                    index = 0;
                }
                this.selectItem(index);
            }.bind(this));

            this.input.addListener('keydown:up', function(){
                var index = this.selectedIndex - 1;
                if (index<0) {
                    index = this.itemActors.length-1;
                }
                this.selectItem(index);
            }.bind(this));

            this.selectItem(0);
        },
        selectItem : function(index){
            _.each(this.itemActors, function(a){
                a.setTextFillStyle('gray');
            });
            this.itemActors[index].setTextFillStyle('white');
            this.selectedIndex = index;
        },
        select: function(){
            this.itemCallbacks[this.selectedIndex]();
        },
        startGame : function(){
            this.game.fsm.startLoad();
            this.game._states['game'] = new this.game._gameState(this.game, 'Game');
        },

	});

	return MainMenuState;
});

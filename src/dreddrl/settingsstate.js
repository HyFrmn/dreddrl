define(['sge', './config'], function(sge, config){
	var SettingsState = sge.GameState.extend({
        initState: function(){
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            var title = new CAAT.TextActor().setText(config.buildDate).setFont('64px sans-serif').setTextAlign('center').setLocation(width/2,height/2 - 32);
            var instruct = new CAAT.TextActor().setText('Press Enter to Continue').setFont('16px sans-serif').setTextAlign('right').setLocation(width-32,height-32);
            this.container.addChild(new CAAT.Actor().setSize(width,height).setFillStyle('black'));
            this.container.addChild(title);
            this.container.addChild(instruct);
            this.scene.addChild(this.container);
            this.finish = function(){
                this.game.fsm.endSettings();
            }.bind(this);
            this.input.addListener('keydown:' + config.AButton, this.finish);
            this.input.addListener('keydown:' + config.BButton, this.finish);
            this.input.addListener('keydown:' + config.XButton, this.finish);
            this.input.addListener('keydown:' + config.YButton, this.finish);
            this.input.addListener('tap', this.finish);
        }
    });
    return SettingsState
})

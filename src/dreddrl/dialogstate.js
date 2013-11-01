define(['sge', './expr', './config'], function(sge, Expr, config){
    var DialogState = sge.GameState.extend({
        initState: function(){
            this._keepScene = true;
            this._dialogList = [];
            this._choosing = false;
            this._choiceIndex = 0;
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            this.dialogContainer = new CAAT.ActorContainer().setLocation(16, height/2 - 32);
            //this.container.addChild(new CAAT.Actor().setSize(width,height).setFillStyle('black').setAlpha(0.5));
            
            var instruct = new CAAT.TextActor().
                                setText('Press Space to Continue').
                                setFont('16px sans-serif').
                                setTextAlign('right').
                                setLocation(width-32,height-32);

            this.container.addChild(instruct);
            this.container.addChild(this.dialogContainer);
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:' + config.AButton, this.interact);
            this.input.addListener('keydown:' + config.BButton, this.interact);
            this.input.addListener('keydown:up', this.up.bind(this));
            this.input.addListener('keydown:down', this.down.bind(this));
        },
        startState : function(){
            this.interact();
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
            this._dialogList = [];
            this.scene = null;
            this._super();
        },
        up: function(){
            this._choiceIndex-=1;
            if (this._choiceIndex<0){
                this._choiceIndex = this._choices.length-1;
            }
            this.displayChoices();
        },
        down: function(){
            this._choiceIndex+=1;
            if (this._choiceIndex>=this._choices.length){
                this._choiceIndex = 0;
            }
            this.displayChoices();
        },
        interact: function(){
            if (this._choosing){
                this._choosing = false;
                var choice = this._currentNode.choices[this._choiceIndex];
                this.parseNode(choice, true);
                this._choiceIndex = 0;
                this.interact();
            } else {
                if (this._dialogList.length<=0){
                    var nodeList = this.nextNode();
                    if (nodeList.length){
                        if (nodeList.length==1){
                            this.parseNode(nodeList[0]);
                        } else {
                            this._choices = nodeList
                            this.displayChoices();
                        }
                    } else {
                        this.game.fsm.endDialog();
                        return
                    }
                } else {
                    this.setDialogText(this._dialogList.shift());
                }
            }
        },
        parseNode: function(node, skip){
            skip = skip===undefined ? false : skip;
            this._currentNode = node;
            if (typeof node === 'string'){
                this._dialogList = [node];
            } else {
                if (!skip){
                    if (node.topic){
                        this._dialogList.push('pc:' + node.topic);
                    }
                }
                if (node.dialog){
                    for (var i = 0; i < node.dialog.length; i++) {
                        var dialog = node.dialog[i];
                        this._dialogList.push(dialog.entity+': '+dialog.text);
                    }
                }
            }
        },
        tick: function(){
            this.game._states['game']._paused_tick();
        },
        setDialog: function(node, ctx){
            this._currentNode = node;
            this._ctx = ctx || {};
            this.parseNode(node);
        },
        nextNode: function(){
            var callback = this._currentNode.postAction;
            if (callback){
                var expr = new Expr(callback);
                expr.loadContext(this._ctx);
                expr.run();
            }
            return this._currentNode.choices || [];
        },
        _clearScreen: function(){
            this.dialogContainer.stopCacheAsBitmap();
            this.dialogContainer.emptyChildren();
        },
        displayChoices: function(){
            var choices = this._choices;
            this._clearScreen();
            this._choosing = true;
            for (var i = choices.length - 1; i >= 0; i--) {
                var choice = choices[i].topic;
                var actor = new CAAT.TextActor().setFont('24px sans-serif');
                
                actor.setLocation(16, i*24);
                if (i==this._choiceIndex){
                    actor.setTextFillStyle('orange');
                    choice = '> ' + choice;
                }
                actor.setText(choice);
                this.dialogContainer.addChild(actor);
            };
        },
        setDialogText: function(dialog){
            this.dialog = dialog;
            this._clearScreen();
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

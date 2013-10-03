define(['sge', './expr', './config'], function(sge, Expr, config){
    var when = sge.vendor.when;


    var EntityCutsceneActions = {
        navigate : function(cutscene, entity, target){
            cutscene.activateEntities(entity, target);
            entity.get('navigate').navToEntity(target, function(){
                cutscene.deactiveEntities(entity,target);
                cutscene.completeAction();
            }.bind(this));
        },
        dialog: function(cutscene, node){
            console.log(node)
            cutscene.startDialog(node);
        },
        moveAway: function(cutscene){
            cutscene.completeAction();
        },
        event: function(cutscene, entity, evt, arg0, arg1, arg2){
            entity.fireEvent(evt, arg0, arg1, arg2);
            cutscene.completeAction();
        },
        set: function(cutscene, entity, attr, value){
            entity.set(attr, value);
            cutscene.completeAction();
        },
        follow: function(cutscene, entity, target, options){
            entity.set('ai.behaviour', 'follow', target, options);
            cutscene.completeAction();
        },
    }

    var Cutscene = sge.Class.extend({
        init: function(state){
            this.state = state;
            this._queue = [];
            this.actions = {
                entity: EntityCutsceneActions
            }
        },
        activateEntities : function(args){
            for (var i = arguments.length - 1; i >= 0; i--) {
                this.state._activeEntities.push(arguments[i]);
            };
        },
        deactiveEntities: function(args){
            for (var i = arguments.length - 1; i >= 0; i--) {
                var idx = this.state._activeEntities.indexOf(arguments[i]);
                if (idx>=0){
                    this.state._activeEntities.splice(idx,1);
                }
            };
        },
        play: function(){
            this.next();
        },
        end: function(){
            this.state.endScene();
        },
        startDialog : function(node, ctx){
            this.state.setDialog(node, ctx, this.completeAction.bind(this));
        },
        next: function(){
            if (this._queue.length<=0){
                this.end();
            }
            var action = this._queue.shift();
            console.log('Action:', action);
            var args = action.args;
            args.splice(0,0,this);
            var lib = action.callback.split('.')[0];
            var func = action.callback.split('.')[1];
            var callback = this.actions[lib][func];
            callback.apply(this, args)
        },
        completeAction: function(){
            if (this._queue.length>0){
                this.next();
            } else {
                this.end();
            }
        },
        addAction: function(){
            console.log(arguments);
            var args = Array.prototype.slice.call(arguments);
            var callback = args.shift();
            var action = {
                callback: callback,
                args: args
            }
            this._queue.push(action);
        }
    })

    var CutsceneState = sge.GameState.extend({
        initState: function(){
            //Keep main game state visible. 
            this._keepScene = true;

            //A list of active entities.
            this._activeEntities = [];

            //Setup choices
            this._dialogList = [];
            this._choosing = false;
            this._choiceIndex = 0;
            this._choices = [];

            //Dialog Callback
            this._dialogCallback = null;

            //End Cutscene
            this.endScene = function(){
                console.log('End Scene')
                this.game.fsm.endCutscene();
            }.bind(this);

            //Setup the Dialog Elements.
            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            this.dialogContainer = new CAAT.ActorContainer().setLocation(16, height/2 - 32);
            //this.container.addChild(new CAAT.Actor().setSize(width,height).setFillStyle('black').setAlpha(0.5));
            
            //Instruction to move on.
            var instruct = new CAAT.TextActor().setText('Press Space to Continue').setFont('16px sans-serif').setTextAlign('right').setLocation(width-32,height-32);
            this.container.addChild(instruct);
            this.container.addChild(this.dialogContainer);
            

            //Bind interactions to key presses.
            this.interact = this.interact.bind(this);
            this.input.addListener('keydown:' + config.AButton, this.interact);
            this.input.addListener('keydown:' + config.BButton, this.interact);
            this.input.addListener('keydown:up', this.up.bind(this));
            this.input.addListener('keydown:down', this.down.bind(this));
        },
        
        _testScene : function(){
            var pc = this.game._states['game'].pc;
            

            var citizen = this.game._states['game'].getEntitiesWithTag('shopper')[0];
            citizen.set('highlight.color','lime');


            var testScene = new Cutscene(this);
            testScene.addAction('entity.navigate', citizen, pc); 
            testScene.addAction('entity.event', citizen, 'highlight.on');
            testScene.addAction('entity.dialog', {
                        topic: '',
                        dialog: [{entity:'npc', text: "JUDGE! Judge! Come quick. The spacers broke into my appartment and are holding my daughter hostage. (Use the arrow keys to move around.)" }],
                    });
            testScene.addAction('entity.event', citizen, 'highlight.off');
            testScene.addAction('entity.moveAway', citizen, pc, 64);
            testScene.addAction('entity.follow', citizen, pc, { dist: 32, speed: 'match'});

            testScene.play()
        },
        startState : function(){
            //this.interact();
            var state = this.game._states['game'];
            
            //Disable HUD
            state._uiContainer.setVisible(false);
            
            //Grab scene from main game and add our own container. Needs to be removed on clean up.
            this.scene = state.scene;

            //Add Cutscene UI
            this.scene.addChild(this.container);

            this._super();

            this._testScene();
        },
        endDialog : function(){
            if (this._dialogCallback){
                this._dialogCallback();
                this._dialogCallback = null;
            } else {
                this.endState();
            }
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
                        this.endDialog();
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
        tick: function(delta){
            var state = this.game._states['game'];

            //this.game._states['game'].tick(delta);
            this._activeEntities.forEach(function(entity){
                entity.componentCall('updateNavigation');
            })
            state.physics.resolveCollisions(delta, this._activeEntities);
            state.getEntities().forEach(function(entity){
                entity.componentCall('render');

            })
        },
        setDialog: function(node, ctx, callback){
            this._currentNode = node;
            this._ctx = ctx || {};
            this.parseNode(node);
            this.setDialogText(this._dialogList.shift());
            this._dialogCallback = callback;
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
            console.log('Update Text:', dialog)
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
    return CutsceneState;
})

define(['sge', './config'], function(sge, config){
    var TextActorFactory = function(text){
        return new CAAT.TextActor().
                        setFont('32px sans-serif').
                        setAlign('left').
                        setText(text);
    }

	var MenuState = sge.GameState.extend({
        initState: function(){
            this._keepScene = true;

            this._menuItems = null;
            this._menuIndex = 0;

            var width = this.game.renderer.width;
            var height = this.game.renderer.height;
            this.container = new CAAT.ActorContainer().setBounds(0,0,width,height);
            this.container.addChild(new CAAT.Actor().setSize(width-32,height-32).setFillStyle('black').setAlpha(0.5).setLocation(16,16));
            this.menuContainer = new CAAT.ActorContainer().setBounds(32,32,width-64,height-64);
            this.container.addChild(this.menuContainer);
            this.unpause = function(){
                this.game.fsm.unpause();
            }.bind(this);
            this.input.addListener('keydown:' + config.pauseButton, this.unpause);
            this.input.addListener('tap', this.unpause);
            this.input.addListener('keydown:up', this.up.bind(this));
            this.input.addListener('keydown:down', this.down.bind(this));
            this.input.addListener('keydown:enter', this.select.bind(this));
        },
        startState : function(){
            var state = this.game._states['game'];

            //Disable HUD
            state._uiContainer.setVisible(false);

            this.scene = state.scene;
            this.scene.addChild(this.container);
            items = state.pc.get('inventory.items').map(function(item){
                return [item.name, item];
            });
            this.createMenu('Inventory!', items).then(function(item){
                
                item.use(state.pc);
                console.log('Using!!', item.use, state.pc);
                state.pc.get('inventory').removeItem(item);
                this.unpause();
                console.log('Used:', item);
            }.bind(this));
            this._super();
        },
        endState : function(){
            var state = this.game._states['game'];

            //Disable HUD
            state._uiContainer.setVisible(true);

            this.scene.removeChild(this.container);
            this.scene = null;
            this._super();
        },
        tick : function(delta){
            func = this.game._states['game']._paused_tick;
            if (func){
                func.call(this.game._states['game'], delta);
            }
        },
        createMenu : function(title, items){
            
            this._menuTitle = title;
            this._menuItems = items;
            this._menuIndex = 0;
            this._menuDeferred = new sge.vendor.when.defer();
            this.updateMenu();
            return this._menuDeferred.promise;
        },
        updateMenu : function(){
            var x,y;
            x = y = 16;
            var menu = new CAAT.ActorContainer().setBounds(0,0,this.container.width, this.container.height);
            var title = TextActorFactory(this._menuTitle).setLocation(x,y);
            menu.addChild(title);
            this.menuContainer.emptyChildren();
            this.menuContainer.addChild(menu);
            for (var i = this._menuItems.length - 1; i >= 0; i--) {
                y+=32;
                var color = 'white';
                var icon = '-';
                if (i==this._menuIndex){
                    color = 'orange';
                    icon = '>'
                }
                var item = TextActorFactory(icon + this._menuItems[i][0]).setLocation(x,y).setTextFillStyle(color);
                menu.addChild(item);
            };
        },
        down: function(){
            this._menuIndex = Math.max(this._menuIndex-1, 0);
            console.log('IDX:', this._menuIndex);
            this.updateMenu();
        },

        up: function(){
            this._menuIndex = Math.min(this._menuIndex+1,this._menuItems.length-1);
            console.log('IDX:', this._menuIndex);
            this.updateMenu();
        },

        select: function(){
            var selectedItem = this._menuItems[this._menuIndex][1];
            this._menuDeferred.resolve(selectedItem);
            return selectedItem;
        }
    });
    return MenuState
});
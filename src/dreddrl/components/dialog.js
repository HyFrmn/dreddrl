define(['sge'], function(sge){
    var Dialog = sge.Component.extend({
        init: function(entity, data){
            this._super(entity, data);
            this.data.tree = data.tree || [];
            this.data.context = {
                self: entity
            };
            this.entity.addListener('interact', function(msg, length){
                this.startDialog();
            }.bind(this));
        },
        _set_tree: function(dialogTree){
            this.data.context = {
                self: this.entity
            }
            if (Object.prototype.toString.call( dialogTree ) === '[object Array]'){
                this.data.tree = dialogTree;
            } else {
                this.data.tree = dialogTree.tree;
                var keys = Object.keys(dialogTree.context);
                for (var i = keys.length - 1; i >= 0; i--) {
                    this.data.context[keys[i]] = dialogTree.context[keys[i]];
                }
            }
            return this.data.tree;
        },
        startDialog: function(){
            var tree = this.get('tree');
            if (tree.length>0){
                this.entity.state.startDialog(tree[0], this.data.context);
            }      
        },
        register: function(state){
            this._super(state);
            this.scene = this.state.scene;
            this.container = new CAAT.ActorContainer().setLocation(32,-24);
            this.bg = new CAAT.Actor().setSize(32,16).setFillStyle('black');
            this.container.addChild(this.bg);
            this.text = new CAAT.TextActor().setLocation(2,2).setFont(this.fontSize + 'px sans-serif');
            this.container.addChild(this.text);
            this.container.setVisible(false);
            this.entity.get('xform').container.addChild(this.container);
        },
        deregister: function(state){
            this.entity.get('xform').container.removeChild(this.container);
            this._super(state);
        },
        _set_text: function(text){
            this.data.text = text;
            this.text.setText(text);
            this.text.calcTextSize(this.state.game.renderer);
            this.bg.setSize(this.text.textWidth+4, this.fontSize + 8);
            return text;
        }
    });

    sge.Component.register('dialog', Dialog);

    return Dialog;
});

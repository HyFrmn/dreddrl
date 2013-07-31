define(['sge', './config'], function(sge, config){
	/*
	*
	* Abstract Item Class
	* 
	* 
	*
	*/
	var id=0;
	var Item = sge.Class.extend({
		init: function(options){
			this._contexts = []
			this.id = id++;
			this.name = options.name || 'Simple Item';
			this.description = options.description || 'A simple object.'
			this.spriteFrame = options.spriteFrame || 1;
			this.spriteImage = options.spriteImage || 'scifi_icons_1.png';
			this.immediate = options.immediate || false;
			this.actions = options.actions || {};
			this.encounter = options.encounter || null;
		},
		get: function(path){
			return this[path];
		},
		set: function(path, value){
			if (path.match(/^actions/)){
				var evt = path.split('.')[1];
				this.actions[evt] = value;
			}
		},
		addContext: function(ctx){
            this._contexts.push(ctx)
        },
        getContext: function(){
            var ctx = {};
            this._contexts.forEach(function(context){
                for (key in context){
                    ctx[key] = context[key];
                }
            })
            return ctx;
        }
	});

	function ajax(url, callback){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('get', url, true);
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState === 4) {
		  	    if (xmlHttp.status === 200) {
			        callback(xmlHttp.responseText, xmlHttp);
			    } else {
			        console.error('Error: ' + xmlHttp.responseText);
			    }
			} else {
			  //still loading
			}
		};
	}
	var library = {};
	Item.bootstrap = function(){
		ajax(config.itemDataUrl, function(rawtext){
			var data = JSON.parse(rawtext);
			data.forEach(function(item){
				library[item.id]=item;
			})
		});
	}

	Item.Factory = function(name, options){
		options = options || {};
		var def = sge.util.deepExtend({}, library[name]);
		var item = new Item(sge.util.deepExtend(def, options));
		return item;
	}

	return Item;
});
define(['sge'], function(sge){
	var Action = sge.Class.extend({
		init: function(entity, data){
			this.entity = entity;
			this.children = []
			this.label = null;

			if(data.type === undefined) {
            data.type = 'action';
	        }
	        if(data.label === undefined) {
	            data.label = data.type;
	        }
	        if(data.children === undefined) {
	            data.children = [];
	        }
	        if(data.args === undefined) {
	            data.args = [];
	        }
	        this.type = data.type;
	        this.args = data.args;
	        this.label = data.label;
	        this.leaf = true;
	        this.loadChildren(data);
			},
		add : function(child) {
	        this.children.push(child);
	    },
	    remove : function(child) {
		        this.children.remove(child);
		    },
	    uiInterface : function(){
		        return null;
	    },
	    
	    loadChildren : function(data) {
		        for(var i = 0; i < data.children.length; i++) {
		            var child = data.children[i];
		            var action = rpg.Action.Load(child);
		            this.add(action);
		        }
	    },
	    run : function(state) {
	    		this.state = state;
		        this.start.apply(this, this.args);
	    },
	    start : function() {

	    },
	    end : function() {
		        var eventSystem = this.getEngine().getPlugin('event');
		        eventSystem.actions = eventSystem.actions.without(this);
		        this.getEvent().run();
	    },
	    evalExpr : function(expr, ctx) {
	        //DANGEROUS;
	        var expr_ = this.parseExpr(expr, ctx);
	        var evaled = eval(expr_);
	        return evaled;
	    },
	    parseExpr : function(expr, ctx) {
	        var parsedExpr = expr;
	        var matches = (expr + "").match(/\$\{(@?[\w()"'\.]+)\}/g);
	        if(matches) {
	            _.each(matches, function(variable) {
	                var path = variable.match(/\$\{(@?[\w()\.]+)\}/)[1];
	                var value = this.evalValue(path, ctx);
	                parsedExpr = parsedExpr.replace(variable, value);
	            }.bind(this));
	        }
	        return parsedExpr;
	    },
	    evalValue : function(path, ctx){
	        var _ctx = ctx;
	        if (path.match(/^@/)){
	            var name = path.split('.')[0];
	            name = name.replace('@(','').replace(')','');
	            if (name=='state'){
	            	_ctx = this.state;
	            } else {
		            _ctx = this.state.getEntitiesWithTag(name)[0];
		        }
	            path = path.replace('@(' + name + ').', '');
	        }
	        return _ctx.get(path);
	    },
	    setAttr : function(path, value, method) {
	    	_ctx = this.entity;
	    	console.log('PATH', path)
	        if (path.match(/^@/)){
	            var name = path.split('.')[0];
	            name = name.replace('@(','').replace(')','');
	            if (name=='state'){
	            	_ctx = this.state;
	            } else {
		            _ctx = this.state.getEntitiesWithTag(name)[0];
		        }
	            path = path.replace('@(' + name + ').', '');
	        }
	        return _ctx.set(path, value, method);
	    },
	});

	Action._classHash = {};

	Action.Load = function(entity, data) {
		var type = data.type;
	    var cls = Action._classHash[type];
	    if(cls === undefined) {
	        return null;
	    }
	    var comp = new cls(entity, data);
	    comp.type = type;
	    return comp;
	};

	Action.register = function(name, klass){
		Action._classHash[name] = klass;
	};

	Action.Exists = function(type) {
	    return Action._classHash.keys().include(type);
	};

	Action.List = function(type) {
	    return rpg.Action._classHash.keys();
	};


	return Action;
});
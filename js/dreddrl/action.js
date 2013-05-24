define(['sge'], function(sge){
	var Action = sge.Class.extend({
		init: function(ctx, data){
			this.ctx = ctx;
			this.data = data;
			this.async = false;
			this._next = null;
		},
		start: function(){
			this.end();
		},
		end: function(){
			this.next();
		},
		run: function(){
			this.start.apply(this, this.data);
			if (!this.async){
				this.end();
			}
		},
		next: function(){
			if (this._next){
				this._next.run();
			}
		},
		chain: function(action){
			if (this._next){
				action.chain(this._next);
			}
			this._next = action;
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
	            var name = path.match(/@\(([a-zA-Z0-9.]*)\)/)[1];
	            path = path.replace(/@\(([a-zA-Z0-9.]*)\)\./,'');
	            if (name=='state'){
	            	_ctx = this.ctx.state;
	            }  else if (name.match(/encounter\./)){
            		_ctx = this.ctx.get(name);
            	} else {
		            _ctx = this.ctx.state.getEntitiesWithTag(name)[0];
		        }
	            path = path.replace('@(' + name + ').', '');
	            console.log('name', name, _ctx.get(path))
	        }
	        return _ctx.get(path);
	    },
	    setAttr : function(path, value, method) {
	    	var _ctx = this.ctx;
	        if (path.match(/^@/)){
	            var name = path.match(/@\(([a-zA-Z0-9.]*)\)/)[1];
	            path = path.replace(/@\(([a-zA-Z0-9.]*)\)\./,'');
	            if (name=='state'){
	            	_ctx = this.ctx.state;
	            } else if (name.match(/encounter\./)){
            		_ctx = this.ctx.get(name);
            	} else {
		            _ctx = this.ctx.state.getEntitiesWithTag(name)[0];
		        }
	            path = path.replace('@(' + name + ').', '');
	        }
	        return _ctx.set(path, value, method);
	    },

	})

	Action._classHash = {};

	Action.Load = function(entity, data) {
		var tmp = data.slice(0)
		var type = tmp.shift();
	    var cls = Action._classHash[type];
	    if(cls === undefined) {
	        return null;
	    }
	    var comp = new cls(entity, tmp);
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

	Action.Factory = function(ctx, actionList){
		var firstAction = null;
		var lastAction = null;
        var actions = _.map(actionList, function(actionData){
        	var action = Action.Load(ctx, actionData);
        	if (lastAction){
        		lastAction.chain(action);
        	} else {
        		console.log('First', action, actionData);
        		firstAction = action;
        	}
        	lastAction = action;
        });
        return firstAction;
	}

	return Action;
});

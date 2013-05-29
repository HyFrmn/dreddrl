define(['sge'], function(sge){
	var ContextWrapper = sge.Class.extend({
		init: function(array){
			this.array = array;
		},
		get : function(path){
			var subpaths = path.split('.');
			var data = this.array;
			while (subpaths.length){
				var data = data[subpaths.shift()];
			}
			return data;
		}
	})

	var Context = sge.Class.extend({
		init: function(data){
			this._subContexts = {};
			this._defaultContext = this;
			this.data = data || {}
		},
		addSubContext : function(name, context, default_){
			if (context.get===undefined){
				context = new ContextWrapper(context);
			}
			if (default_){
				this._defaultContext = context;
			}
			if (!this._defaultContext){
				this._defaultContext = context
			}
			this._subContexts[name] = context;
		},
		_getContext : function(path){
			var match = path.match(/[\w]*/)[0];
			ctx = this._defaultContext;
			if (this._subContexts[match]!==undefined){
				ctx = this._subContexts[match];
				path = path.replace(/[\w]*\.?/,'');
			}
			return {
				ctx : ctx,
				path : path,
			}
		},
		get : function(path, value, method){
			var match = path.match(/[\w]*/)[0];
			var scoped = this._getContext(path);
			if (!scoped.path.length){
				return scoped.ctx;
			}
			if (scoped.ctx==this){
				return this.data[path];
			}
			return scoped.ctx.get(scoped.path, value, method);
		},
		set : function(path, value, method){
			
			var scoped = this._getContext(path);
			return scoped.ctx.set(scoped.path, value, method);
		}
	})


	var Action = sge.Class.extend({
		init: function(entity, data){
			this.ctx = new Context();
			this.ctx.addSubContext('entity', entity, true);
			this.ctx.addSubContext('state', entity.state);
			this.ctx.addSubContext('action', this);
			this.entity = entity;
			this.state = entity.state;
			this.data = data;
			this.async = false;
			this._next = null;
		},
		start: function(){
			this.end();
		},
		end: function(){
			if (this.async){
				this.state._activeActions = _.without(this.state._activeActions, this);
			}
			this.next();
		},
		run: function(){
			this.start.apply(this, this.data);
			if (!this.async){
				this.end();
			} else {
				this.state._activeActions.push(this);
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
	        var _ctx = ctx || this.ctx;
	        if (path.match(/^@/)){
	            var name = path.match(/@\(([a-zA-Z0-9.]*)\)/)[1];
	            path = path.replace(/@\(([a-zA-Z0-9.]*)\)\./,'');
	            if (name=='state'){
	            	_ctx = this.ctx.state;
	            }  else if (name.match(/encounter\./)){
            		_ctx = this.ctx.get(name);
            	} else {
		            _ctx = this.state.getEntitiesWithTag(name)[0];
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
	            	_ctx = this.ctx;
	            } else if (name.match(/encounter\./)){
            		_ctx = this.ctx.get(name);
            	} else {
		            _ctx = this.state.getEntitiesWithTag(name)[0];
		        }
	            path = path.replace('@(' + name + ').', '');
	        }
	        return _ctx.set(path, value, method);
	    },
	    get : function(path){
	    	console.log(path);
	    	if (path.match(/data\./)){
	    		path = path.replace(/data\./,'');
	    		index = parseInt(path.split('.')[0]);
	    		path = path.replace(index+'.','');
	    		var val = this.data[index];
	    		console.log(path, index, val);
	    		if (path){
	    			val = val[path];
	    		}
	    		return val;
	    	}
	    },
	    set : function(path, value){

	    }
	})

	Action._classHash = {};

	Action.Load = function(entity, data) {
		var tmp = data.slice()
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
        		firstAction = action;
        	}
        	lastAction = action;
        });
        return firstAction;
	}

	return Action;
});

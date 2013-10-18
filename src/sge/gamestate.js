define(['sge/lib/class', 'sge/vendor/underscore'],
	function(Class, _, PxLoader){

	var Timeout = Class.extend({
		init: function(length, callback){
			this._length = length;
			this.callback = callback;
		},
		tick : function(delta){
			this._length = this._length - delta;
			if (this._length<=0){
				this.callback()
				return false;
			}
			return true;
		}
	})


	var GameState = Class.extend({
		init: function(game, name, options){
			this.game = game;
			this._time = 0;
            this._keepScene = false; 
			this._sceneIndex = game.renderer.scenes.length;
			var scene = game.renderer.createScene();
			this.scene = new CAAT.ActorContainer();
			scene.addChild(this.scene);
			var padding = 0;
			this.scene.setBounds(-padding,-padding,game.renderer.width+padding, game.renderer.height+padding);
			this.input = game.input.createProxy();
			this.entities = {};

			this._name = name;
			this._entity_ids = [];
			this.initState(options);
			this._timeouts = [];
		},
		createTimeout : function(length, callback){
			var timeout = new Timeout(length, callback);
			this._timeouts.push(timeout);
			return timeout;
		},
		tickTimeouts : function(delta){
			_.map(this._timeouts, function(t){return t.tick(delta)});
			this._timeouts = _.filter(this._timeouts, function(t){return t._length>0});
		},
		removeTimeout : function(timeout){
			this._timeouts = _.without(this._timeouts, timeout);
			return timeout;
		},
		initState: function(){

        },
        startState : function(){
        	//console.log('Start:', this._name);
        	this.input.enable = true;
            if (!this._keepScene){
            	this.game.renderer.setScene(this._sceneIndex);
            }
        },
        endState : function(){
        	//console.log('End:', this._name);
        	this.input.enable = false;
        },
        destroyState : function(){
        	
        },
        tick : function(delta){
        	this.tickTimeouts(delta);
        	_.each(this._entity_ids, function(id){
        		var entity = this.entities[id];
        		entity.tick(delta);
        	}.bind(this))
        	_.each(this._entity_ids, function(id){
        		var entity = this.entities[id];
        		entity.componentCall('render', this.game.renderer, 'main');
        	}.bind(this))
        },

        getTime: function(){
        	return this._time;
        },

		getNextId: function(){
			var id = 0;
			while (this._entity_ids.indexOf(id) > -1){
				id++;
			}
			return id;
		},

		addEntity: function(entity){
			var id = this.getNextId();
			entity.id = id;
			this._entity_ids.push(id);
			this.entities[id] = entity;
			entity.state = this;
			entity.register(this);
			return entity;
		},

		getEntity: function(id){
			return this.entities[id];
		},

		getEntities : function(){
			var entities = []
			_.each(this._entity_ids, function(id){
        		entities.push(this.entities[id]);
        	}.bind(this));
        	return entities;
		},

		getEntitiesWithTag: function(tag){
			return _.filter(this.getEntities(), function(e){
				return _.include(e.tags, tag);
			});
		},
		getEntityWithTag: function(tag){
			return _.filter(this.getEntities(), function(e){
				return _.include(e.tags, tag);
			})[0];
		},

		getEntitiesWithComponent: function(comp){
			return _.filter(this.getEntities(), function(e){
				return (e.components[comp]!==undefined);
			});
		},

		removeEntity: function(entity){
			var id = entity.id;
			this._entity_ids = _.without(this._entity_ids, id);
			this.entities[id] = undefined;
			entity.deregister(this);
			entity.id = null;
			entity.state = null;
			return entity;
		}
	});
	return GameState;
});

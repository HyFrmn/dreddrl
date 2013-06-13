angular.module('editor', []).
  directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        var panes = $scope.panes = [];
 
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }
 
        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      },
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  }).
  directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };

  }).
  directive('action', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: { action: '='},
      //template: '<div><span ng-repeat="(arg, meta) in actionData(action)">{{ arg }}</span></div>',
      templateUrl: 'templates/action.html',
      controller: function($scope, $element, $attrs, $transclude) { 
        var _actionData = function(action){
          console.log(action)
          var actionType = action[0];
          var meta = [{
            "name" : "actiontype",
            "type" : "actiontype"
          }].concat($scope.ActionMeta[actionType]);
          decorated = [];
          action.forEach(function(arg, index){
            data = meta[index] || {};
            data.value = arg;
            decorated.push(data);
        });
        
        $scope.addAction = function(parentAction){
          console.log('Add action to:', parentAction)
          $scope.$emit('addAction', parentAction);
        }

        return decorated;
      }
        $scope.actionData = _actionData($scope.action);
      },
      //*
      _actionData : function(action){
        return {'foo':'bar'}
        var actionType = action[0];
        var meta = [{
          "name" : "actiontype",
          "type" : "actiontype"
        }].concat($scope.ActionMeta[actionType]);
        decorated = {};
        action.forEach(function(arg, index){
          decorated[arg] = meta[index];
        });
        console.log(decorated)
        return decorated;
      }
      //*/
    }
  }).
  directive('createentityform', function(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'templates/createentityform.html',
      replace: true,
      controller: function($scope, $element, $attrs){
        $scope.entityName = 'entity';


        $scope.$on('addEntity', function(evt, parentObject){
          $scope.parentObject = parentObject;
          $($element).bPopup();
        });

        $scope.createEntity = function(){
          var entity = {
            meta : {
              inherit: 'citizen',
              spawn: 'room.random',
            }
          }
          console.log($scope.parentObject, $scope.entityName, entity);
          $scope.parentObject[$scope.entityName] = entity;
          $($element).bPopup().close();
        }

      },

    }
  }).
  directive('createcompform', function(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'templates/createcompform.html',
      replace: true,
      controller: function($scope, $element, $attrs){
        $scope.compName = 'comp';


        $scope.$on('addComponent', function(evt, entity){
          $scope.entity = entity;
          $($element).bPopup();
        });

        $scope.createComp = function(){
          $scope.entity[$scope.compName] = {};
          $($element).bPopup().close();
        }

      },

    }
  }).
  directive('editcompform', function(){
    return {
      restrict: 'E',
      transclude: true,
      template : '<div  />',
      //templateUrl: 'templates/editcompform.html',
      replace: true,
      controller: function($scope, $element, $attrs){
        var elem = $($element).prependTo('body');
        $scope.compName = 'comp';
        

        $scope.setTemplate = function(name){
          name = name || '';
          $scope.templateUrl = '/templates/edit' + name + 'compform.html';
        }
        $scope.setTemplate();
        $scope.$on('editComponent', function(evt, saveObject, entity, compName){
          console.log(saveObject, entity, compName);
          $scope.saveObject = saveObject;
          $scope.entity = entity;
          $scope.compName = compName;
          $scope.comp = entity[compName];
          $scope.newCompData = [];
          var meta = $scope.CompMeta[compName];
          if (compName!='actions'){
            $scope.setTemplate();
            for (var key in meta) {
              if (key=='*'){
                continue;
              }
              if (meta.hasOwnProperty(key)) {
                argData = {name: key, value: meta[key]['default'] || ""}
                if ($scope.comp[key]){
                  argData.value = $scope.comp[key];
                }
                $scope.newCompData.push(argData);
              }
            }
          } else {
            $scope.setTemplate('action');
            for (key in $scope.comp){
              if (!key.match(/^[$][$]/)){
                $scope.newCompData.push({name:key, value:$scope.comp[key]});
              }
            }
          }

          elem.bPopup();
        });

        $scope.updateComponent = function(){
          //$scope.entity[$scope.compName] = $scope.comp;
          var newComp = $scope.newCompData;
          console.log(newComp);
          for (var i = 0; i<newComp.length;i++) {
            argData = newComp[i]
            if (argData.value=="" || argData.value===undefined){
              delete $scope.entity[$scope.compName][argData.name];
            } else {
              $scope.entity[$scope.compName][argData.name] = argData.value;
            }
          }
          $scope.$emit('save', $scope.saveObject);
          $scope.newCompData = [];
          $($element).bPopup().close();
        }

        $scope.addActionList = function(){
          var typ = prompt('What callback?');
          $scope.newCompData.push({name:typ, value:[]});
        }

      },

    }
  }).
  directive('createactionform', function(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'templates/createactionform.html',
      replace: true,
      controller: function($scope, $element, $attrs){
        $scope.actionType = '';
        $scope.actionArgs = [];
        $scope.parentAction = null;
        $scope.mode = 'edit';

        $scope.updateActionCallback = function(){
          console.log('action update', this.actionType);
          var meta = $scope.ActionMeta[this.actionType];
          $scope.actionType = this.actionType;
          $scope.actionArgs = meta.slice(0);
        }

        $scope.createAction = function(){
          var newAction = [$scope.actionType];
          $scope.actionArgs.forEach(function(arg){
            newAction.push(arg.value);
          });
          console.log('AddAction', newAction)
          $scope.parentAction.push(newAction);
          $scope.parentAction = null;
          $scope.$emit('save', $scope.saveObject)
          //$scope.saveObject = null;
          $($element).bPopup().close();
        }

        $scope.updateAction = function(){
          var newAction = [$scope.actionType];
          $scope.actionArgs.forEach(function(arg){
            newAction.push(arg.value);
          });
          console.log('Edit Action', newAction)
          $scope.parentAction.splice($scope.actionIndex, 1, newAction);
          $scope.parentAction = null;
          $scope.$emit('save', $scope.saveObject)
          //$scope.saveObject = null;
          $($element).bPopup().close();
        }

        $scope.$on('addAction', function(evt, saveObject, action){
          $scope.saveObject = saveObject;
          console.log('Adding a new action:', action)
          $scope.mode = 'create';
          $scope.parentAction = action;
          $($element).bPopup();
        })

        $scope.$on('editAction', function(evt, saveObject, action, index){
          console.log('Editing action:', action[0], saveObject)
          $scope.saveObject = saveObject;
          $scope.mode = 'edit';
          $scope.parentAction = action;
          $scope.actionType = action[index][0];
          meta = $scope.ActionMeta[$scope.actionType].slice(0);
          $scope.actionArgs = [];
          meta.forEach(function(m, i){
            m.value = action[index][i+1];
            $scope.actionArgs.push(m);
          });
          $scope.actionIndex = index;
          $($element).bPopup();
        })
      },
      
    }
  }).
  controller('AppCtrl', ['$scope', '$http', function($scope, $http){
    $scope.ready = false;
    $scope.ActionMeta = {};
    $scope.CompMeta = {};
    $http.get('/config/actionmeta.json').success(function(data){
      $scope.ActionMeta = data;
      $http.get('/config/compmeta.json').success(function(data){
        $scope.CompMeta = data;
        $scope.ready = true
        $scope.appUrl = '/templates/app.html'
        console.log($scope)
      });
    });
    
    $scope.hasCompMeta = function(typ){
      if ($scope.CompMeta[typ]!==undefined){
        return "true";
      }
      return "false";
    }

    $scope.getCompDataType = function(typ, key){
      var meta = $scope.CompMeta[typ];
      var val = null;
      if (meta[key]!==undefined){
        val = meta[key].type;
      } else {
        val = meta['*'].type
      }
      return val;
    }
  }]);

var EncounterCtrl = function($scope, $http){
  $scope.encounters = [
  ]


  $scope.save = function(){
    $scope.encounters.forEach(function(item){
      $http.post('/encounter/', item);
    });
  }

  $scope.$on('save', function(evt, encounter){
    $scope.saveItem(encounter);
  });

  $scope.saveItem = function(encounter){
    console.log('Saving:', encounter)
    $http.put('/encounter/'+encounter.id, encounter).success(function(){
      console.log('Saved:', encounter.name);
    });
  }

  $scope.addRoom = function(encounter){
    var roomName = prompt("What's the name of this room?");
    var room = {
      name: 'encounterroom',
      locked: false,
      spawn: []
    }
    encounter.rooms[roomName] = room;
  }

  $scope.removeRoom = function(encounter, roomName){
    console.log('Remove:', encounter, roomName)
    delete encounter.rooms[roomName];
  }

  $scope.addEntity = function(encounter){
    $scope.$emit('addEntity', encounter.entities);
  }

  $scope.removeEntity = function(encounter, name){
    delete encounter.entities[name];
    console.log(name);
  }

  $scope.removeAction = function(action, index){
    action.splice(index, 1);
  }

  $scope.newAction = function(encounter, action){
    console.log('Add action to:', action)
    $scope.$emit('addAction', encounter, action, -1);
  }

  $scope.editAction = function(encounter, action, index){
    console.log('Edit action to:', encounter, action, index)
    $scope.$emit('editAction', encounter, action, index);
  }

  $scope.addComponent = function(entity){
    console.log('Add Component!!!')
    $scope.$emit('addComponent', entity)
  }

  $scope.editComponent = function(encounter, entity, compName){
    console.log('Edit Compponent!!')
    $scope.$emit('editComponent', encounter, entity, compName);
  }

  $scope.createEncounter = function(){
    var encounter = {
      name : 'newencounter',
      steps : 1,
      description : 'A new encounter.',
      rooms : {},
      entities : {},
    }
    $scope.encounters.push(encounter);
  }

  

  $scope.getDataType = function(action, index){
    if (index==0){
      return "actiontype"
    } 
    //console.log(action, index)
    var typ = $scope.ActionMeta[action[0]][index-1].type;
    
    return typ;
  }

  $scope.getDataMeta = function(action, index){
    if (index==0){
      return "actiontype"
    } 
    var typ = $scope.ActionMeta[action[0]][index-1];
    return typ;
  }

  $scope.encounters = [];
  //*
  $http.get('/encounter/').success(function(data){
    $scope.encounters = data;
  });
  //*/
}

var _updatePreview = function(scope){
    var frame = parseInt(scope.spriteFrame);
    scope.previewTop = Math.floor(frame/16)*-24;
    scope.previewLeft = left = (frame%16)*-24;
}

var ItemCtrl = function($scope, $http){
      $scope.log = [];

      $scope.save = function(){
        $scope.items.forEach(function(item){
          $http.post('/item/', item);
        });
      }

      $scope.saveItem = function(item){
        console.log(item)
        $http.put('/item/'+item.id, item).success(function(){
          console.log('Saved:', item.name);
          $scope.log.splice(0, 0,'Saved: ' + item.name);
        });
      }

      $scope.createItem = function(){
        var item = {};
        item.id = $scope.newItem.name.toLowerCase();
        item.name = $scope.newItem.name;
        item.description = $scope.newItem.description;
        item.spriteFrame = $scope.newItem.spriteFrame;
        item.spriteImage = $scope.newItem.spriteImage;
        _updatePreview(item);
        $scope.items.push(item);
        $http.post('/item/', item).success(function(){
          console.log('Saved:', item.name);
          $scope.log.splice(0, 0, 'Saved: ' + item.name);
        });
      }

      $scope.updateNewItemPreview = function(){
        _updatePreview($scope.newItem)    
      }
      
      $scope.newAction = {
        item : null,
        action : 'set',
        args: []
      }

      $scope.addAction = function(){
        console.log('Add Action');
        var args = [$scope.newAction.action];
        $scope.newAction.args.forEach(function(arg){
          args.push(arg.value);
        })
        console.log($scope.newAction.item)
        if ($scope.newAction.item.effect===undefined){
          $scope.newAction.item.effect=[];
        }
        $scope.newAction.item.effect.push(args);
        $scope.saveItem($scope.newAction.item);
        $scope.newAction = {
          item : null,
          action : 'set',
          args : []
        }

      }

      $scope.updateActionCallback = function(){
        var meta = $scope.ActionMeta[$scope.newAction.action];
        $scope.newAction.args = meta.slice(0);
      }

      $scope.addActionCallback = function(item){
        $scope.newAction.item = item;
      }

      $scope.newItem = {
          name : "",
          description : "",
          spriteImage : "scifi_icons_1.png",
          spriteFrame : 1,
      };



      $scope.items = [];
      $http.get('/item/').success(function(data){
        $scope.items = data;
        $scope.items.forEach(_updatePreview);
      });
    }
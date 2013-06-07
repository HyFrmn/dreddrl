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

  })

ActionMeta = {
  "set" : [{
    "name" : "path",
    "type" : "path",
  },{
    "name" : "value",
    "type" : "mixed"
  },{
    "name" : "method",
    "type" : "string",
    "enum" : {
        "none" : null,
        "Add" : "add",
        "Multiply" : "mult"
    }
  }],

  "if" : [{
    "name" : "expr",
    "type" : "expr"
  },{
    "name" : "trueactions",
    "type" : "actionlist"
  },{
    "name" : "falseactions",
    "type" : "actionlist"
  }],

  "dialog" : [{
    "name" : "text",
    "type" : "string"
  }]
}

CompMeta = {
  "meta" : {
    "inherit" : { "type" : "string", "default" : "citizen"},
    "room" : {"type" : "string" },
    "spawn" : {"type" : "string"}
  },
  "interact" : {
    "priority" : {"type" : "checkbox"}
  }
}

var EncounterCtrl = function($scope, $http){
  $scope.compMeta = CompMeta;

  $scope.encounters = [
  ]


  $scope.save = function(){
    $scope.encounters.forEach(function(item){
      $http.post('/encounter/', item);
    });
  }

  $scope.saveItem = function(encounter){
    console.log(encounter)
    $http.put('/encounter/'+encounter.name, encounter).success(function(){
      console.log('Saved:', encounter.name);
      $scope.log.splice(0, 0,'Saved: ' + encounter.name);
    });
  }

  $scope.removeEntity = function(encounter, name){
    delete encounter.entities[name];
    console.log(name);
  }

  $scope.hasCompMeta = function(typ){
    if ($scope.compMeta[typ]!==undefined){
      return "true";
    }
    return "false";
  }

  $scope.encounters = [];
  $http.get('/encounter/').success(function(data){
    $scope.encounters = data;
  });
}

var _updatePreview = function(scope){
    var frame = parseInt(scope.spriteFrame);
    console.log('Update:', frame)
    scope.previewTop = Math.floor(frame/16)*-24;
    scope.previewLeft = left = (frame%16)*-24;
}

var ItemCtrl = function($scope, $http){
      $scope.log = [];
      $scope.ActionMeta = ActionMeta;

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
        var meta = ActionMeta[$scope.newAction.action];
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
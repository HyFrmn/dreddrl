var app = angular.module('editor', ['ui.bootstrap','ui.codemirror']);

var _newDialog = function(){
  return {
    topic: 'Topic',
    dialog: [],
    choices: [],
  }
}

app.controller('SelectEntityCtrl', ['$scope', 'dialog', 'quest', function($scope, dialog, quest){
  $scope.entity = null;
  $scope.quest = quest;

  $scope.select = function(){
    dialog.close($scope.entity);
  }

  $scope.close = function(){
    dialog.close(null);
  }
}]);

app.controller('SelectItemCtrl', ['$scope', 'dialog', 'quest', function($scope, dialog, quest){
  $scope.item = null;
  $scope.quest = quest;

  $scope.select = function(){
    dialog.close($scope.item);
  }

  $scope.close = function(){
    dialog.close(null);
  }
}]);

DialogController = function($scope, $http){
  $scope.init = function(parent){
    $scope.parent = {parent: parent};

  }

  $scope.removeDialog = function(node, dialog){
    bootbox.confirm("Are you sure you want to remove this piece of dialog?", function(result){
      if (result){
        var index = node.dialog.indexOf(dialog);
        if (index>=0){
          node.dialog.splice(index,1);
          $scope.$apply(node.dialog);
        }
      }
    });
  }

  $scope.addDialogChoice = function(node){
    var choice = _newDialog();
    node.choices.push(choice);
    return choice;
  }

  $scope.editDialogTopic = function(node){
    bootbox.prompt("What's the topic for this chain of dialog?", function(topic){
      console.log('New Topic:', node, topic);
      node.topic = topic
      $scope.$apply();
    });
  }

  $scope.addDialog = function(quest, node){
    $scope.$emit('selectentity', quest, function(entity){
      console.log('CB:', entity);
        if (!entity){
          return;
        }
        var dialog = {entity: entity.name, text: ""};
        node.dialog.push(dialog);
        return dialog;
    });
  }

  $scope.removeChoice = function(parent, child){
    console.log('R:', parent.parent, child);
    var index = parent.parent.indexOf(child);
    if (index>=0){
      parent.parent.splice(index, 1);
    };
    return child;
  }

  $scope.addDialogPostAction = function(node){
    node.postAction = "//Post Dialog Action";
  }

  $scope.removeDialogPostAction = function(node){
    delete node.postAction;
  }
}

function AppController($scope, $http){
  $scope.ENTITYTYPE = ['citizen','lawbreaker','spacer'];
  $scope.Math = Math;
  $scope.codeMirrorOptions = {
    lineWrapping : true,
        lineNumbers: true,
    mode: 'javascript'
  }

  $scope.createQuest = function(){
    var quest = {};
    quest.name="New Quest";
    quest.enable = true;
    quest.rooms = [];
    quest.entities = [];
    quest.items = [];
    quest.steps = [];
    quest.steps[0] = {number:0};
    $scope.Package.quests.push(quest);
    return quest;
  };

  $scope.Package = {};
  $scope.Package.quests = [];
  $scope.Package.quests.push($scope.createQuest());

  $http.get('/quest/').success(function(data){
    $scope.Package.quests = data;
  });
}

function StepCtrl($scope){
  $scope.addStepDialog = function(quest, step){
    console.log(step);
    $scope.$emit('selectentity', quest, function(entity){
      if (!entity){
        return;
      }
      var node = _newDialog();
      node.entity = entity;
      if (step.dialog===undefined){
        step.dialog=[];
      }
      step.dialog.push(node);
    });
  }
}

app.controller('QuestController', function($dialog, $scope, $http, $timeout) {

  $scope.saveSuccess = true;

  $scope._saveSuccessful = function(quest){
    bootbox.alert('Quest Saved: ' + quest.name);
  }

  $scope.saveQuest = function(quest){
    var url = '/quest/';
    if (quest.id!==undefined){
      url += quest.id
      $http.put(url, quest).success(function(data){

        $scope._saveSuccessful(quest);
      });
    } else {
      $http.post(url, quest).success(function(data){
        quest.id = data.id;
        $scope._saveSuccessful(quest);
      });
    } 
  }
  
  $scope.deleteQuest = function(Package, quest){
    var index = Package.quests.indexOf(quest);
    if (index>=0){
      Package.quests.splice(index,1);
      var url = '/quest/destroy/' + quest.id;
      $http.get(url).success(function(){
        bootbox.alert('Quest Deleted: '+ quest.name);
      });
    }
  }

  $scope.createRoom = function(quest){
    var names = quest.rooms.map(function(r){return r.name});
    console.log('Names:', names);
    var name = "room";
    if (names.indexOf(name)>=0){
      var orig = name;
      var i = 1;
      while (names.indexOf(name)>=0){
        name = orig + i;
        i++;
      }
    }
    var room = {
      name:name,
      entities: []
    };
    quest.rooms.push(room);
  };
  
  $scope.spawnEntity = function(quest, room){
    $scope.$emit('selectentity', quest, function(entity){
     $scope.$apply(room.entities.push(entity.name));
     return entity;
    })
  };
  
  $scope.removeEntityFromRoom = function(room, entity){
      var index = room.entities.indexOf(entity);
      if (index>=0){
        room.entities.splice(index,1);
      }
  };
  
  $scope.createEntity = function(quest){
    var entity = {
      name: 'newentity',
      type:'citizen',
    };
    quest.entities.push(entity);
    return entity; 
  };

  $scope.createDialogTree = function(entity){
    var node = _newDialog();
    entity.dialog = [node];
    return node;
  }

  $scope.addStep = function(quest){
    var numbers = quest.steps.map(function(s){return s.number});
    var max = Math.max.apply(Math, numbers);
    var step = {number: max+10};
    quest.steps.push(step);

    quest.steps = quest.steps.filter(function(step){
      return step.number !== undefined;
    })
  }

  $scope.createItem = function(quest){
    var item = 
      {
      "type" : "item",
      "name" : "New Item",
      "description" : "Some sort of thing.",
      "spriteFrame" : 0,
    }
    quest.items.push(item);
  }

  $scope.deleteItem = function(quest, item){
    var index = quest.items.indexOf(item);
    if (index>=0){
      quest.items.splice(index,1);
    }
  }

  $scope.addInventoryItem = function(quest, entity){
    $scope.$emit('selectitem', quest, function(item){
      if (entity.inventory===undefined){
        entity.inventory=[];
      }
      if (!(item.name in entity.inventory)){
        entity.inventory.push(item.name);
      }
      return item;
    });
  };

  $scope.removeInventoryItem = function(entity, item){
    bootbox.confirm("Are you sure you want to remove this piece of dialog?", function(result){
      if (result){
        var index = entity.inventory.indexOf(item);
        console.log('I', entity.inventory, item);
        if (index>=0){
          $scope.$apply(entity.inventory.splice(index,1));
        }
      }
    });
  }

  $scope.init = function(){
    $scope.shouldBeOpen = false;
  }

  $scope.$on('selectentity', function(evt, quest, callback){
    $scope.openSelectEntityDialog(quest, callback);
  });

  $scope.$on('selectitem', function(evt, quest, callback){
    var d = $dialog.dialog({resolve:{quest: function(){return angular.copy(quest)}, callback: function(){return angular.copy(callback)}}});
    d.open('templates/selectitemdialog.html', 'SelectItemCtrl').then(callback);
  })

  $scope._selectEntityDialogCallback = function(){
    if($scope.selectedDialog.entity===null){
      $scope.selectedDialog.entity={name:'pc'};
    }
    
    var entity = $scope.selectedDialog.entity;
    if ($scope._selectEntityDialogCallbackFunc){
      $scope._selectEntityDialogCallbackFunc(entity);
    }
  }

  $scope.openSelectEntityDialog = function(quest, callback) {
    var d = $dialog.dialog({resolve:{quest: function(){return angular.copy(quest)}, callback: function(){return angular.copy(callback)}}});
    d.open('templates/selectentitydialog.html', 'SelectEntityCtrl').then(callback);
  };

  $scope.closeSelectEntityDialog = function () {
    $scope.shouldBeOpenSelectEntityDialog = false;
    $scope._selectEntityDialogCallbackFunc = null;
  };

  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

});


angular.module('editor', ['ui.bootstrap']);
function QuestController($scope, $http){
  $scope.ENTITYTYPE = ['citizen','lawbreaker','spacer'];
  
  $scope.createQuest = function(){
    var quest = {};
    quest.name="New Quest";
    quest.rooms = [];
    quest.entities = [];
    quest.items = [];
    quest.steps = [];
    quest.steps[0] = {};
    return quest;
  };

  $scope.saveQuest = function(quest){
    var url = '/quest/';
    if (quest.id!==undefined){
      url += quest.id
      $http.put(url, quest).success(function(data){
        console.log(data);
      });
    } else {
      $http.post(url, quest).success(function(data){
        console.log(data);
      });
    }
    
  }
  
  $scope.createRoom = function(quest){
    var room = {
      name:"Room",
      entities: []
    };
    quest.rooms.push(room);
  };
  
  $scope.spawnEntity = function(room){
     var entity = prompt("What type of entity?");
     room.entities.push(entity);
     return entity;
  };
  
  $scope.removeEntityFromRoom = function(room, entity){
      
  };
  
  $scope.createEntity = function(quest){
    var entity = {
      name: 'newentity',
      type:'citizen',
    };
    quest.entities.push(entity);
    return entity; 
  };

  $scope.createDialog = function(entity){
    var node = {
      choices: []
    }
    entity.dialog = [node];
    return node;
  }

  $scope.addStepDialog = function(step){
    var entityName = prompt("Dialog for which entity?");//TODO: Replace with nice dialog.
    var node = {
      entity: entityName,
      choices: []
    }
    if (step.dialog===undefined){
      step.dialog=[];
    }
    step.dialog.push(node)
    return node;
  }
  
  $scope.addDialogChoice = function(node){
    var choice = {
      choices: []
    };
    node.choices.push(choice);
    return choice;
  }

  $scope.addDialogPostAction = function(node){
    node.postAction = "";
  }

  $scope.removeDialogPostAction = function(node){
    delete node.postAction;
  }

  $scope.addStep = function(quest){
    var step = {number: 0};
    quest.steps.push(step);

    quest.steps = quest.steps.filter(function(step){
      return step.number !== undefined;
    })
  }
  $scope.Package = {};
  $scope.Package.quests = [];
  $scope.Package.quests.push($scope.createQuest());

  $http.get('/quest/').success(function(data){
    $scope.Package.quests = data;
  })
}


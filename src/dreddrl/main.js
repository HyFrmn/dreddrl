define(
	[
		'./dreddrlstate',
		'./dialogstate',
		'./pausestate',
		'./mainmenustate',
		'./cutscenestate',
		'./config'
	],
function(DreddRLState, DialogState, PauseState, MainMenuState, CutsceneState, config){
	return {
		DreddRLState : DreddRLState,
		DialogState : DialogState,
		PauseState : PauseState,
		MainMenuState : MainMenuState,
		CutsceneState : CutsceneState,
		config : config,
		CreateGame : function(GameClass, width, height, fps){
			game = new GameClass({
		        elem: document.getElementById('game'),
	            pauseState: PauseState,
	            mainMenuState: MainMenuState,
	            width: parseInt(width || 720),
	            height: parseInt(height || 240),
	            fps: parseInt(fps || 30),
	        });
		    
		    var state = game.setGameState(DreddRLState);
		    game._states['dialog'] = new DialogState(game, 'Dialog');
		    
		    //Should create function when this works.
		    game._states['cutscene'] = new CutsceneState(game, 'Cutscene');
		    game.fsm.addEvent({name:'startCutscene', from:'game',to:'cutscene'});
		    game.fsm.addEvent({name:'endCutscene', from:'cutscene',to:'game'});

		    return game;
		}
	}
})

define(
	[
		'./dreddrlstate',
		'./dialogstate',
		'./pausestate',
		'./mainmenustate'
	],
function(DreddRLState, DialogState, PauseState, MainMenuState){
	return {
		DreddRLState : DreddRLState,
		DialogState : DialogState,
		PauseState : PauseState,
		MainMenuState : MainMenuState
	}
})
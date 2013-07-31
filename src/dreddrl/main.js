define(
	[
		'./dreddrlstate',
		'./dialogstate',
		'./pausestate',
		'./mainmenustate',
		'./config'
	],
function(DreddRLState, DialogState, PauseState, MainMenuState, config){
	return {
		DreddRLState : DreddRLState,
		DialogState : DialogState,
		PauseState : PauseState,
		MainMenuState : MainMenuState,
		config : config
	}
})

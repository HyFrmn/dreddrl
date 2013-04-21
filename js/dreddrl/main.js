define(
	[
		'./dreddrlstate',
		'./dialogstate',
		'./pausestate'
	],
function(DreddRLState, DialogState, PauseState){
	return {
		DreddRLState : DreddRLState,
		DialogState : DialogState,
		PauseState : PauseState
	}
})
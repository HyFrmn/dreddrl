requirejs.config({
    baseUrl: 'js/',
    name: "dreddrl",
    packages: ["dreddrl","sge"],
    shim : {
    	'sge/vendor/underscore' : {
    		exports: '_'
    	}
    }
});
// Start the main app logic.
var game = null;
requirejs(['jquery','sge','dreddrl'],
function   ($, sge, dreddrl) {
    game = new sge.Game({elem: '#game'});
    var state = game.setGameState(dreddrl.DreddRLState);
    game._states['dialog'] = new dreddrl.DialogState(game);
    game.start();
});

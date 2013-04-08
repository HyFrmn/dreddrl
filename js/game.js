requirejs.config({
    baseUrl: 'js/',
    name: "dreddrl",
    packages: ["dreddrl","sge"],
    shim : {
    	'sge/vendor/underscore' : {
    		exports: '_'
    	},
        'sge/vendor/caat' : {
            exports: 'CAAT'
        }
    }
});
// Start the main app logic.
var game = null;
requirejs(['jquery','sge','dreddrl'],
function   ($, sge, dreddrl) {
    CAAT.DEBUG=1;
    game = new sge.Game({elem: '#game'});
    var state = game.setGameState(dreddrl.DreddRLState);
    game._states['dialog'] = new dreddrl.DialogState(game, 'Dialog');
    game.start();
});

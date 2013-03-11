requirejs.config({
    baseUrl: 'js/',
    shim: {
        'sge/vendor/underscore': {
          exports: '_'
        }
    },
    packages: ["sge","dreddrl"]
});
// Start the main app logic.
var game = null;
requirejs(['jquery','sge','dreddrl'],
function   ($, sge, dreddrl) {
    game = new sge.Game({elem: '#game'});
    var state = game.setGameState(dreddrl.DreddRLState);
    game.start();
});

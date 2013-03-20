requirejs.config({
    baseUrl: 'js/',
    shim: {
        'sge/vendor/underscore': {
          exports: '_'
        }
    },
    name: "sge startup",
    packages: ["sge"]
});
// Start the main app logic.
var game = null;
requirejs(['jquery','sge'],
function   ($, sge) {
    game = new sge.Game({elem: '#game'});
    game.start();
});

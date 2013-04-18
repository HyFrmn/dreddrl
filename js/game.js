requirejs.config({
    baseUrl: 'js/',
    name: "dreddrl",
    packages: ["dreddrl","sge"],
    shim : {
        'sge/vendor/underscore' : {
            exports: '_'
        },
        'sge/vendor/virtualjoystick' : {
            exports: 'VirtualJoystick'
        },
        'sge/vendor/hammer' : {
            exports: 'Hammer'
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
    //Setup Ratio
    var body = $('body');
    var idealWidth = 4;
    var idealHeight = 3;
    var idealRatio = idealWidth/idealHeight;
    var screenRatio = body.width() / body.height();
    if (screenRatio > idealRatio){
        height = body.height();
        width = Math.round(height / idealHeight) * idealWidth;
    } else {
        width = body.width();
        height = Math.round(width / idealWidth) * idealHeight;
    }
    var elem = $('#container');
    elem.attr({width: width, height: height});
    elem.css({
        width: width + 'px',
        height: height + 'px',
        display: 'block',
        margin: '0px auto'
    });
    //CAAT.DEBUG=1;
    game = new sge.Game({elem: '#game'});
    var state = game.setGameState(dreddrl.DreddRLState);
    game._states['dialog'] = new dreddrl.DialogState(game, 'Dialog');
    game.start();
});

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
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }


    //Setup Ratio
    var body = $('body');
    var idealWidth = parseInt(getURLParameter('width') || 640);
    var idealHeight = parseInt(getURLParameter('height') || 360);
    var idealRatio = idealWidth/idealHeight;
    var screenRatio = body.width() / body.height();
    if (screenRatio > idealRatio){
        height = body.height();
        width = height * idealRatio;
    } else {
        width = body.width();
        height = width / idealRatio;
    }
    var elem = $('#container');
    elem.attr({width: width, height: height});
    elem.css({
        width: width + 'px',
        height: height + 'px',
        display: 'block',
        margin: '0px auto'
    });
    CAAT.DEBUG=Boolean(getURLParameter('caat-debug'));
    game = new sge.Game({elem: '#game', pauseState: dreddrl.PauseState, mainMenuState: dreddrl.MainMenuState, width: idealWidth, height: idealHeight});
    var state = game.setGameState(dreddrl.DreddRLState);
    game._states['dialog'] = new dreddrl.DialogState(game, 'Dialog');
    game.start();
});

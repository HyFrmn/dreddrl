requirejs.config({
    baseUrl: 'js/',
    name: "dreddrl",
    /*
    packages: ["dreddrl"],
    */
    shim: {
        'sge' : {
            exports: ['Hammer','CAAT']
        }
    }
});
// Start the main app logic.
var game = null;
requirejs(['sge','dreddrl'],
function   (sge, dreddrl) {
    dreddrl.DreddRLState.init();
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    //Setup Ratio
    //var body = $('body');
    var idealWidth = parseInt(getURLParameter('width') || 640);
    var idealHeight = parseInt(getURLParameter('height') || 480);
    var idealFPS = parseInt(getURLParameter('fps') || 60);
    canvasElem = document.getElementById('game');
    if (true || getURLParameter('fullscreen')){
        idealWidth = window.innerWidth;
        idealHeight = window.innerHeight;
        canvasElem.className = "fullscreen";
    }
    var idealRatio = idealWidth/idealHeight;
    canvasElem.style.width = idealWidth + 'px';
    canvasElem.style.height = idealHeight + 'px';
    CAAT.DEBUG=Boolean(getURLParameter('caat-debug'));
    game = new sge.Game({elem: document.getElementById('game'), pauseState: dreddrl.PauseState, mainMenuState: dreddrl.MainMenuState, width: idealWidth, height: idealHeight, fps:idealFPS});
    var state = game.setGameState(dreddrl.DreddRLState);
    game._states['dialog'] = new dreddrl.DialogState(game, 'Dialog');
    game.start();
});

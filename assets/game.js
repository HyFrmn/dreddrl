requirejs.config({
});
// Start the main app logic.
var game = null;
requirejs(['sge','dreddrl'],
function   (sge, dreddrl) {
    dreddrl.config.questDataUrl = '/quest/';

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    //Setup Ratio
    //var body = $('body');
    var idealWidth = parseInt(getURLParameter('width') || 640);
    var idealHeight = parseInt(getURLParameter('height') || 360);
    var idealFPS = parseInt(getURLParameter('fps') || 60);
    canvasElem = document.getElementById('game');
    
    //Full Screen Always
    
    var resizeCallback = function(){
        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;
        var pixelWidth, pixelHeight;
        if ((innerWidth / innerHeight) < 1.7777){
            pixelWidth = innerWidth;
            pixelHeight = Math.round(innerWidth / 1.77777);
        } else {
            pixelHeight = innerHeight;
            pixelWidth = Math.round(innerHeight * 1.7777);
        }
        canvasElem.style.width = pixelWidth + 'px';
        canvasElem.style.height = pixelHeight + 'px';
        canvasElem.style['margin-left'] = (innerWidth - pixelWidth)/2 + 'px';
        canvasElem.style['margin-top'] = (innerHeight - pixelHeight)/2 + 'px';
    }
    window.onresize = resizeCallback;
    resizeCallback();
    CAAT.DEBUG=Boolean(getURLParameter('caat-debug'));
    game = new sge.Game({elem: document.getElementById('game'), pauseState: dreddrl.PauseState, mainMenuState: dreddrl.MainMenuState, width: idealWidth, height: idealHeight, fps:idealFPS});
    var state = game.setGameState(dreddrl.DreddRLState);
    game.start();
});

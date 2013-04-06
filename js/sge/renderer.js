define(['jquery', 'sge/vendor/caat', 'sge/lib/class'], function($, CAAT, Class){
    var Renderer = Class.extend({
        init: function(elem){
            this.width = 640;
            this.height = 480
            
        }
    })

    return Renderer;
})
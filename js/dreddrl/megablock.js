define([
    'sge',
    'jquery',
    './factory',
    './map'
    ],
    function(sge, $, Factory, Encounters, Map){
    	var FLOORTILE =  { srcX : 0, srcY: 0, spriteSheet: 'future2'};
        var CEILTILE = { srcX : 0, srcY: 36, layer: "canopy", spriteSheet: 'future2'}
        var DOOROPENTILE1 = { srcX : 1, srcY: 36, spriteSheet: 'future2'}
        var DOOROPENTILE2 = { srcX : 1, srcY: 37, spriteSheet: 'future2'}
        var DOORCLOSEDTILE1 = { srcX : 2, srcY: 36, spriteSheet: 'future2'}
        var DOORCLOSEDTILE2 = { srcX : 2, srcY: 37, spriteSheet: 'future2'}



    	var MegaBlockLevel = sge.Class.extend({
    		init: function(block){
    			this.block = block;

    		},
    	});

    	var MegaBlock = sge.Class.extend({
    		init : function(){
    			this._levels = []; //Precompute Entire Block. (Memory? What's memory?)
    		},

    	})

    }
);
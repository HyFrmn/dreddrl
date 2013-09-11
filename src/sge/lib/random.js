define([],function(){
	var unit = function(){
			return Math.random();
	}
	var range = function(min, max){
		var delta = max - min;
		return ((Math.random() * delta) + min);
	}
	var rangeInt = function(min, max){
		return Math.round(range(min, max));
	}
	var item = function(array){
		var length = array.length-1;
		return array[Math.round(Math.random() * length)];
	}

	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o){ //v1.0
	    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}

	return {
		unit : unit,
		range : range,
		rangeInt : rangeInt,
		item : item,
		shuffle : shuffle
	}
})

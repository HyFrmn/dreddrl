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
		var length = array.length;
		return array[Math.round(Math.random() * length)];
	}
	return {
		unit : unit,
		range : range,
		rangeInt : rangeInt,
		item : item
	}
})
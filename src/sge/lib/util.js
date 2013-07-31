define([],function(){
	var extend = function(destination, source)
	{
	    for (var property in source)
	    {
	        if (destination[property] && (typeof(destination[property]) == 'object')
	                && (destination[property].toString() == '[object Object]') && source[property])
	            extend(destination[property], source[property]);
	        else
	            destination[property] = source[property];
	    }
	    return destination;
	}

	var deepExtend = function(destination, source) {
	  for (var property in source) {
	    if (source[property] && source[property].constructor &&
	     source[property].constructor === Object) {
	      destination[property] = destination[property] || {};
	      arguments.callee(destination[property], source[property]);
	    } else {
	      destination[property] = source[property];
	    }
	  }
	  return destination;
	};

	var ajax = function(url, callback){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('get', url, true);
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState === 4) {
		  	    if (xmlHttp.status === 200) {
			        callback(xmlHttp.responseText, xmlHttp);
			    } else {
			        console.error('Error: ' + xmlHttp.responseText);
			    }
			} else {
			  //still loading
			}
		}
	}

	return {
		extend: extend,
		deepExtend: deepExtend,
		ajax : ajax,
	}
})

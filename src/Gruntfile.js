// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
//
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.initConfig({

	    // The clean task ensures all files are removed from the dist/ directory so
	    // that no files linger from previous builds.
	    clean: [".tmp/"],

	    concat: {"dreddrl.js" : ["../assets/js/require.js",".tmp.js"]},

	    // This task uses James Burke's excellent r.js AMD build tool.  In the
	    // future other builders may be contributed as drop-in alternatives.
	    requirejs: {
		  compile: {
		    options: {
		      baseUrl: ".",
		      name: 'dreddrl',
		      out: ".tmp.js",
		      //dir: "build/",
		      optimize: "none",
		      //exclude: ['sge'],
		      packages: ['dreddrl','sge'],
		      shim: {
		        'sge/vendor/hammer' : {
		            exports: 'Hammer'
		        },
		        'sge/vendor/caat' : {
		            exports: 'CAAT'
		        },
		        'sge/vendor/underscore' : {
		            exports: '_'
		        }
		    }
		    }
		  }
}
	});

	grunt.registerTask("default", ["requirejs", "concat"]);
}
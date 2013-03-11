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
	    clean: ["dist/"],

	    concat: {"dreddrl.js" : ["js/require.js","build/required.js"]},

	    // This task uses James Burke's excellent r.js AMD build tool.  In the
	    // future other builders may be contributed as drop-in alternatives.
	    requirejs: {
		  compile: {
		    options: {
		      baseUrl: "js/",
		      mainConfigFile: "js/game.js",
		      out: "build/required.js",
		      optimize: "none"
		    }
		  }
}
	});

	grunt.registerTask("default", ["requirejs", "concat"]);
}
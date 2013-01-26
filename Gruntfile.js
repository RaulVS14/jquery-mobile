module.exports = function( grunt ) {
	"use strict";

	var path = require( "path" ),
		httpPort =  Math.floor( 9000 + Math.random()*1000 ),
		name = "jquery.mobile",
		dist = "dist/",
		distpaths = [
			dist + name + ".js",
			dist + name + ".min.map",
			dist + name + ".min.js"
		],
		banner = {
			normal: [
				"/*",
				"* jQuery Mobile v<%= pkg.version %>",
				"* http://jquerymobile.com",
				"*",
				"* Copyright 2010, 2013 jQuery Foundation, Inc. and other contributors",
				"* Released under the MIT license.",
				"* http://jquery.org/license",
				"*",
				"*/",
				"",
				"" ].join( grunt.util.linefeed ),
			minified: "/*! jQuery Mobile v<%= pkg.version %> | (c) 2010, 2013 jQuery Foundation, Inc. | jquery.org/license */"
		};

	// grunt plugins
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-connect" );
	grunt.loadNpmTasks( "grunt-contrib-qunit" );
	grunt.loadNpmTasks( "grunt-contrib-requirejs" );
	grunt.loadNpmTasks( "grunt-css" );
	grunt.loadNpmTasks( "grunt-git-authors" );
	grunt.loadNpmTasks( "grunt-junit" );


	function resolveCSSImports( filePath ) {
		var dir = path.dirname( filePath ),
			content = grunt.file.read( filePath ).toString(),
			files = [];

		content.replace(/@import\s+.*?['"]([^'"]+)/gim, function(match, location, a) {
			grunt.log.debug( "importing: " + path.join( dir, location ));
			files.push( path.resolve( path.join( dir, location )) );
		});

		return files;
	}

	// Project configuration.
	grunt.config.init({
		pkg: grunt.file.readJSON( "package.json" ),

		jshint: {
			js: {
				options: {
					jshintrc: "js/.jshintrc"
				},
				files: {
					src: "js/**/*.js"
				}
			},
			grunt: {
				options: {
					jshintrc: ".jshintrc"
				},
				files: {
					src: [ "Gruntfile.js" ]
				}
			}
		},

		requirejs: {
			js: {
				options: {
					baseUrl: "js",

					optimize: "none",

					//Finds require() dependencies inside a require() or define call.
					findNestedDependencies: true,

					//If skipModuleInsertion is false, then files that do not use define()
					//to define modules will get a define() placeholder inserted for them.
					//Also, require.pause/resume calls will be inserted.
					//Set it to true to avoid this. This is useful if you are building code that
					//does not use require() in the built project or in the JS files, but you
					//still want to use the optimization tool from RequireJS to concatenate modules
					//together.
					skipModuleInsertion: true,

					mainConfigFile: "js/requirejs.config.js",

					name: name,

					exclude: [
						"jquery",
						"depend",
						"text",
						"text!../version.txt"
					],

					out: dist + name + ".js",

					pragmasOnSave: {
						jqmBuildExclude: true
					},

					//File paths are relative to the build file, or if running a commmand
					//line build, the current directory.
					wrap: {
						startFile: "build/wrap.start",
						endFile:   "build/wrap.end"
					},

					onBuildWrite: function (moduleName, path, contents) {
						//Always return a value.
						//This is just a contrived example.
						return contents.replace(/__version__/g, grunt.config.process( "\"<%= pkg.version %>\"" ) );
					}
				}
			}
		},

		uglify: {
			all: {
				options: {
					banner: banner.minified,
					sourceMapRoot: "dist",
					sourceMapPrefix: 1,
					sourceMap: dist + name + ".min.map",
					beautify: {
						ascii_only: true
					}
				},
				files: {
					"dist/jquery.mobile.min.js": [ dist + name + ".js" ]
				}
			}
		},

		concat: {
			options: {
				banner: banner.normal
			},
			css: {
				files: {
					"dist/jquery.mobile.structure.css": resolveCSSImports( "css/structure/jquery.mobile.structure.css" ),
					"dist/jquery.mobile.theme.css": [ "css/themes/default/jquery.mobile.theme.css" ]
				}
			}
		},

		cssmin: {
			options: {
				banner: banner.minified
			},
			structure: {
				files: {
					"dist/jquery.mobile.structure.min.css": [ "dist/jquery.mobile.structure.css" ]
				}
			},
			theme: {
				files: {
					"dist/jquery.mobile.theme.min.css": [ "dist/jquery.mobile.theme.css" ]
				}
			}
		},

		connect: {
			server: {
				options: {
					port: httpPort,
					base: '.'
				}
			}
		},

		qunit: {
			options: {
				timeout: 10000
			},
			files: [
				"tests/unit/**/index.html",
				"!tests/unit/core/index.html",
				"!tests/unit/dialog/index.html",
				"!tests/unit/event/index.html",
				"!tests/unit/kitchensink/index.html",
				"!tests/unit/init/**",
				"!tests/unit/listview/cache-tests/*",
				"!tests/unit/loader/**",
				"!tests/unit/navigation/**",
				"!tests/unit/select/cached*"
			],
			http: {
				options: {
					urls: [
						"http://localhost:9001/tests/unit/core/index.html",
						"http://localhost:9001/tests/unit/dialog/index.html",
						"http://localhost:9001/tests/unit/event/index.html"
//				"!tests/unit/kitchensink/index.html",
//				"!tests/unit/init/**",
//				"!tests/unit/listview/cache-tests/*",
//				"!tests/unit/listview/push-state-disabled-tests.html",
//				"!tests/unit/loader/**",
//				"!tests/unit/navigation/**",
//				"!tests/unit/popup/back-two.html",
//				"!tests/unit/popup/other.html",
//				"!tests/unit/popup/popup-sequence-test-dialog.html",
//				"!tests/unit/select/cached*"

					]
				}

			}
		}

	});

	grunt.registerTask( "js",  [ "requirejs", "uglify" ] );
	grunt.registerTask( "css", [ "concat", "cssmin" ] );

	// Default grunt
	grunt.registerTask( "default", [ "js", "css" ] );

};
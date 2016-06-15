/*global module */
/*jshint indent:2 */
module.exports = function(grunt) {
  // Do grunt-related things in here

// Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    paths: {
      base : '<%= pkg.corePrefix %>-',
      core : '<%= pkg.corePrefix %>-<%= pkg.version %>'
    },

    // copy maximized CSS and JS files as well as external dependencies 
    copy: { // backup part 1 & part of deployment
      html: {
        src: 'src/index.html',
        // dest: 'build/<%= pkg.version %>/<%= pkg.corePrefix %>.max.html',
        dest: 'build/<%= pkg.version %>/index.html',
      },
      css: {
        src: 'src/<%= pkg.corePrefix %>.max.css',
        dest: 'build/<%= pkg.version %>/<%= pkg.corePrefix %>.max.css',
      },
      jsAll: {
        src: 'src/js/*.js',
        dest: 'build/<%= pkg.version %>/js/',
        expand:true,
        flatten: true
      },
      jQueryDeploy: {
        src: 'src/js/jquery-<%= pkg.jqVersion %>.min.js',
        dest: 'deploy/<%= pkg.version %>/jquery-<%= pkg.jqVersion %>.min.js',
      }
    },
    processhtml: {
      options: {
        // process: true,
        data: {
          version: '<%= pkg.version %>',
          incVersion: '<%= pkg.incVersion %>',
          jqVersion: '<%= pkg.jqVersion %>'
        }
      },
      dist: {
        files: {
          'deploy/<%= pkg.version %>/index.html': ['src/index.html']
        }
      }
    },
    htmlcompressor: {
      compile: {
        files: {
          'deploy/<%= pkg.version %>/index.html': 'deploy/<%= pkg.version %>/index.html'
        },
        options: {
          type: 'html',
          preserveServerScript: true,
          preservePhp: true,
          removeQuotes: true,
          removeSurroundingSpaces:"all",
          compressJs: true
        }
      }
    },
    autoprefixer: {
      options: {
        // Task-specific options go here.
        browsers: ['> 1%','last 2 versions', 'Firefox ESR', 'Opera 12.1', 'iOS >=6', 'Android >= 4', 'Explorer >= 9'],
        diff:true,
        // map:false
      },
      your_target: {
        // Target-specific file lists and/or options go here.
        options: {
          // Target-specific options go here.
        },
        src: 'src/<%= pkg.corePrefix %>.max.css',
        dest: 'deploy/<%= pkg.version %>/<%= paths.core %>-ap.css'
      },
    },
    cssmin: {
      withbanner: {
        // options: {
        //   banner: '/* NLV core <%= pkg.version %> */'
        // },
        files: {
          // 'deploy/<%= pkg.version %>/<%= paths.core %>.css': ['src/<%= pkg.corePrefix %>.max.css']
          'deploy/<%= pkg.version %>/<%= paths.core %>.css': ['deploy/<%= pkg.version %>/<%= paths.core %>-ap.css']
        }
      }
    },

    closureCompiler:  {
      options: {
        // [REQUIRED] Path to closure compiler
        compilerFile: '../compiler.jar',

        // [OPTIONAL] set to true if you want to check if files were modified
        // before starting compilation (can save some time in large sourcebases)
        checkModified: false,

        // [OPTIONAL] Set Closure Compiler Directives here
        compilerOpts: {
          /**
           * Keys will be used as directives for the compiler
           * values can be strings or arrays.
           * If no value is required use null
           *
           * The directive 'externs' is treated as a special case
           * allowing a grunt file syntax (<config:...>, *)
           *
           * Following are some directive samples...
           */
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          externs: [
            'src/js/lib/jquery-<%= pkg.jqVersion %>.min.js'
          ],
          // define: ["'goog.DEBUG=false'"],
          warning_level: 'quiet',
          // jscomp_off: ['checkTypes', 'fileoverviewTags'],
          summary_detail_level: 3,
          create_source_map: 'deploy/<%= pkg.version %>/<%= paths.core %>.map',
          source_map_format: 'V3'
          // output_wrapper: '(function(){%output%}).call(this);'
        }
      },
      // any name that describes your task
      dist: {

        // [OPTIONAL] Target files to compile. Can be a string, an array of strings
        // or grunt file syntax (<config:...>, *)
        src: [
          'src/js/jb.inc.js',
          'src/js/<%= pkg.corePrefix %>.max.js',
        ],

        // [OPTIONAL] set an output file
        dest: 'deploy/<%= pkg.version %>/<%= paths.core %>.js'
      }
    },
    concat: {
      // README this concat call is only needed as long as Closure Compiler does not allow adding sourceRoot via CLI 
      // ... and adds windows-style \\ insteader of / for paths
      options: {
        process: function(src) {
          return src.replace(/\\\\/g, '/').replace('"sources"','"sourceRoot":"../../",\n"sources"');
        },
      },
      jsSourceMap: {
        // the files to concatenate
        src: ['deploy/<%= pkg.version %>/<%= paths.core %>.map'],
        // the location of the resulting CSS file
        dest: 'deploy/<%= pkg.version %>/<%= paths.core %>.map'
      }
    },
    // createHtaccess: {
    //   task: {
    //     src: [
    //       '/nlvHTML5/<%= paths.core %>.css', 
    //       // 'https://ajax.googleapis.com/ajax/libs/jquery/<%= pkg.jqVersion %>/jquery.min.js',
    //       '/nlvHTML5/<%= paths.inc %>.inc.js', 
    //       '/nlvHTML5/<%= paths.core %>.js'
    //     ],
    //     // the location of the resulting CSS file
    //     dest: 'deploy/<%= pkg.version %>/.htaccess'

    //   }
    // }
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-htmlcompressor');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-autoprefixer');
  // Default task(s).
  grunt.registerTask('default', ['copy','autoprefixer','cssmin','processhtml','htmlcompressor','closureCompiler','concat']);
  grunt.registerTask('html', ['processhtml','htmlcompressor']);
  grunt.registerTask('js-deploy', ['closureCompiler','concat']);

};
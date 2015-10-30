module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('yocto-hint');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    yoctohint : {
      options : {},
      all : [ 'Gruntfile.js' ]
    },
    uglify : {
      options : {
        banner : '/* <%= pkg.name %> - <%= pkg.description %> - V<%= pkg.version %> */\n'
      },
      api : {
        files : [ {
          expand : true,
          cwd : 'src',
          src : '**/*.js',
          dest : 'dist'
        } ]
      }
    },
    mochacli : {
      options : {
        'reporter' : 'spec',
        'inline-diffs' : false,
        'no-exit' : true,
        'force' : false,
        'check-leaks' : true,
        'bail' : false
      },
      all : [ 'test/*.js' ]
    }
  });
  grunt.registerTask('uglify', 'Processing minifications your js file', [ 'uglify' ]);
  grunt.registerTask('hint', 'Hint & validate your code with JsHint et JSCS', [ 'yoctohint' ]);
  grunt.registerTask('tests', 'Running defined unit tests', [ 'mochacli' ]);
  grunt.registerTask('build', 'Processing Hint, unit tests, and minification', [ 
    'hint',
    'tests',
    'uglify'
   ]);
  grunt.registerTask('default', 'Processing default build', [ 'build' ]);
};
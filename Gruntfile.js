'use strict';

module.exports = function (grunt) {
  // init config
  grunt.initConfig({
    // default package
    pkg       : grunt.file.readJSON('package.json'),
    // hint our app
    yoctohint : {
      options  : {},
      all      : [ 'src/***', 'Gruntfile.js' ]
    },
    // Uglify our app
    uglify    : {
      options : {
        banner  : '/* <%= pkg.name %> - <%= pkg.description %> - V<%= pkg.version %> */\n'
      },
      api     : {
        files : [ {
          expand  : true,
          cwd     : 'src',
          src     : '**/*.js',
          dest    : 'dist'
        } ]
      }
    },
    // unit tests
    mochacli  : {
      options : {
        'reporter'       : 'spec',
        'inline-diffs'   : false,
        'no-exit'        : true,
        'force'          : false,
        'check-leaks'    : true,
        'bail'           : false
      },
      all     : [ 'test/*.js' ]
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('yocto-hint');

  grunt.registerTask('hint', 'yoctohint');
  grunt.registerTask('tests', 'mochacli');
  grunt.registerTask('build', [ 'hint', 'tests', 'uglify' ]);
  grunt.registerTask('default', 'build');
};

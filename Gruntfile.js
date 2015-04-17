/*
 * grunt-pagespeed-junit
 * https://github.com/jeremy-green/grunt-pagespeed-junit
 *
 * Copyright (c) 2014 Jeremy Green
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    pagespeed_junit: {
      options: {
        urls: ['http://www.example.com'],
        reports: ['report.xml'],
        key: '<API_KEY>',
        threshold: 10,
        ruleThreshold: 2
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Register default task
  grunt.registerTask('default', ['pagespeed_junit']);
};

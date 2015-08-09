/*
 * grunt-pagespeed-junit
 * https://github.com/jeremy-green/grunt-pagespeed-junit
 *
 * Copyright (c) 2015 Jeremy Green
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  grunt.registerTask('pagespeed_junit', 'Pagespeed to junit task runner for grunt.', function () {
    var done = this.async();
    var options = this.options({
      //default: options
      threshold: 60
    });

    var request = require('request'),
        querystring = require('querystring'),
        async = require('async'),
        builder = require('xmlbuilder');

    var reports = options.reports || [];
    var report = options.report || options.dest;
    var url = options.url;
    var urls = options.urls || [];

    /**
     * backwards compatibility
     */
    if (typeof url !== 'undefined' && urls.indexOf(url) === -1) {
      urls.push(url);
    }
    if (typeof report !== 'undefined' && reports.indexOf(report) === -1) {
      reports.push(report);
    }

    /**
     * Delete options we're not going to use
     */
    delete options.urls;
    delete options.reports;
    delete options.dest;
    delete options.report;

    /**
     * Lets copy yslow and turn urls/reports into an object
     */
    var pages = [];
    for (var i = 0; i < urls.length; i++) {
      if (reports.length >= i) {
        pages.push({
          url: urls[i],
          report: reports[i]
        });
      }
    }

    async.each(pages, function(page, callback) {
      options.url = page.url;
      var q = querystring.stringify(options),
          u = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?' + q,
          failures = 0;

      request(u, function (error, response, body) {
        grunt.log.writeln('Running PageSpeed Insights on ' + page.url + '.');

        if (!error && response.statusCode === 200) {
          var b = JSON.parse(body);
          var stats = b.pageStats;
          var results = b.formattedResults;
          var ruleResults = results.ruleResults;
          var xml = builder.create('testsuites', {
            failures: '%%FAILURES%%',
            name: b.title,
            tests: Object.keys(ruleResults).length
          })
          .ele('testsuite', {
            failures: '%%FAILURES%%',
            name: b.title,
            tests: Object.keys(ruleResults).length
          })
          .ele('properties');

          [
            'kind',
            'id',
            'responseCode',
            'title',
            'score'
          ].forEach(function(element, index, array) {
            xml = xml.ele('property', {
              name: element,
              value: b[element]
            }).up();
          });

          xml = xml.up();

          Object.keys(ruleResults).forEach(function(key, index) {
            var val = ruleResults[key];
            var blocks = val.urlBlocks;

            var tc = xml.ele('testcase', {
              assertions: 1,
              classname: val.localizedRuleName,
              name: val.localizedRuleName,
              status: val.ruleImpact,
              time: ''
            });

            if (typeof options.ruleThreshold !== 'undefined' && parseFloat(val.ruleImpact) > options.ruleThreshold) {
              failures++;
              tc.ele('failure', {
                message: 'Rule exceeds threshold.'
              });
            }

            var impact = 'Rule Impact: ' + val.ruleImpact + '\n';

            blocks.forEach(function(element) {

              var format = element.header.format;
              var args = element.header.args;

              if (typeof args !== 'undefined' && args.length > 0) {
                args.forEach(function(arg, i) {
                  arg.value = arg.value.replace(/&/g, '&amp;')
                                       .replace(/"/g, '&quot;')
                                       .replace(/'/g, '&#39;')
                                       .replace(/</g, '&lt;')
                                       .replace(/>/g, '&gt;');

                  if (arg.type !== 'HYPERLINK') {
                    format = format.replace('$' + (i+1).toString(), arg.value);
                  } else {
                    format += ' [' + args[0].value + ']';
                  }
                });
                impact += format + '\n';
              }

              if (typeof element.urls !== 'undefined') {
                args = element.urls;
                args.forEach(function(arg, i) {
                  format = arg.result.format;
                  var a = arg.result.args;
                  a.forEach(function(elem, iterator) {
                    elem.value = elem.value.replace(/&/g, '&amp;')
                                           .replace(/"/g, '&quot;')
                                           .replace(/'/g, '&#39;')
                                           .replace(/</g, '&lt;')
                                           .replace(/>/g, '&gt;');

                    format = format.replace('$' + (iterator+1).toString(), elem.value);
                  });
                  impact += format + '\n';

                });

              }

            });

            tc.ele('system-out', {}, impact);
            xml = tc.up();

          });

          var output = xml.end({pretty: true}).replace(/%%FAILURES%%/g, failures.toString());
          grunt.file.write(page.report, output);
          grunt.log.ok('File: ' + page.report + ' created.');

          if (parseInt(b.score) < options.threshold) {
            grunt.fail.warn('Score of ' + b.score + ' is below defined threshold.');
          }
        } else {
          grunt.fail.warn('Error retrieving results.');
        }
        callback();
      });

    }, done);

  });
};

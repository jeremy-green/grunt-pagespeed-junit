/*
 * grunt-pagespeed-junit
 * https://github.com/jeremy-green/grunt-pagespeed-junit
 *
 * Copyright (c) 2014 Jeremy Green
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
        querystring = require('querystring');

    var dest = options.dest;
    delete options.dest;

    var q = querystring.stringify(options),
        url = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?' + q,
        failures = 0;

    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var b = JSON.parse(body);
        var stats = b.pageStats;
        var results = b.formattedResults;

        var output = '<?xml version="1.0" encoding="UTF-8"?>';
        output += '<testsuites failures="%%FAILURES%%" name="'+b.title+'" tests="'+Object.keys(results.ruleResults).length+'">';
        output += '<testsuite failures="%%FAILURES%%" id="'+b.id+'" name="'+b.title+'" tests="'+Object.keys(results.ruleResults).length+'">';

        output += '<properties>';
        [
          'kind',
          'id',
          'responseCode',
          'title',
          'score'
        ].forEach(function(element, index, array) {
          output += '<property name="'+element+'" value="'+b[element]+'"/>';
        });
        output += '</properties>';

        var ruleResults = results.ruleResults;
        Object.keys(ruleResults).forEach(function(key, index) {
          var val = ruleResults[key];
          var blocks = val.urlBlocks;
          output += '<testcase assertions="1" classname="'+val.localizedRuleName+'" name="'+val.localizedRuleName+'" status="'+val.ruleImpact+'" time="">';

          if (options.ruleThreshold !== undefined && parseFloat(val.ruleImpact) > options.ruleThreshold) {
            failures++;
            output += '<failure message="Rule exceeds threshold."/>';
          }

          output += '<system-out>';
          output += 'Rule Impact: ' + val.ruleImpact + '\n';

          blocks.forEach(function(element) {

            var format = element.header.format;
            var args = element.header.args;

            if (args !== undefined && args.length > 0) {
              args.forEach(function(arg, i) {
                arg.value = arg.value.replace(/&/g, '&amp;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&#39;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;');
                if (arg.type !== 'HYPERLINK') {
                  format = format.replace('$' + (i+1).toString(), arg.value);
                } else {
                  format += '[  ' + args[0].value + ' ]';
                }
              });
              output += format + '\n';
            }

            if (element.urls !== undefined) {
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
                output += format + '\n';

              });

            }

          });

          output += '</system-out>';
          output += '</testcase>';
        });

        output += '</testsuite>';
        output += '</testsuites>';

        output = output.replace(/%%FAILURES%%/g, failures.toString());

        grunt.file.write(dest, output);

        if (parseInt(b.score) < options.threshold) {
          grunt.fail.warn('Score of ' + b.score + ' is below defined threshold.');
        }
      } else {
        grunt.fail.warn('Error retrieving results.');
      }
      done(error);
    });

  });
};

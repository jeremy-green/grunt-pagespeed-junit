# grunt-pagespeed-junit

> Pagespeed to junit task runner for grunt. Perfect for outputting results in Jenkins. See [Google's doc](https://developers.google.com/speed/docs/insights/v1/getting_started) for more details on the API.

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-pagespeed-junit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-pagespeed-junit');
```

## The "pagespeed_junit" task

### Overview
In your project's Gruntfile, add a section named `pagespeed_junit` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  pagespeed_junit: {
    options: {
      // Task-specific options go here.
    }
  }
});
```

### Options

#### url
Type: `String`

The URL of the page for which the PageSpeed Insights API should generate results.

#### dest
Type: `String`

The output destination.

#### key
Type: `String`

Your API key identifies your project and provides you with API access, quota, and reports.

#### threshold
Type: `int`
Default value: `60`

The score threshold in which to fail the task.

#### ruleThreshold
Type: `Number`

The rule threshold in which to fail the individual rules.

#### locale
Type: `String`

The locale that results should be generated in.

#### rule
Type: `Array`

The PageSpeed rules to run.

#### strategy
Type: `String`

The strategy to use when analyzing the page.

### Usage Examples

```js
grunt.initConfig({
  pagespeed_junit: {
    options: {
      url: 'http://www.example.com',
      key: '<API_KEY>',
      dest: 'results.xml',
      threshold: 10,
      ruleThreshold: 2
    }
  }
});
```

###TODO

* Different file output
* Refactor task js
* ruleThreshold per rule


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

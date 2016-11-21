var path = require('path');

var mapping = {};
var rootPath = (__dirname).split(path.sep).slice(-1)[0];

mapping['/components/' + rootPath  +
'/app/bower_components'] = 'bower_components';

var ret = {
  'verbose' : false,
  'persistent' : false,
  'browsers' : ['chrome'],
  'suites': ['app/test'],
  'webserver': {
    'pathMappings': [mapping]
  },
  'plugins': {
    'istanbul': {
      'dir': './coverage_components',
      'reporters': ['text', 'text-summary', 'lcov'],
      'include': [
        '/app/elements/**/*.html'
      ],
      "exclude": [
        '/app/elements/routing.html'
      ],
      'thresholds': {
        'global': {
          'statements': 65
        }
      }
    }
  }
};

module.exports = ret;

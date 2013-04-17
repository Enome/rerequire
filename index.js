var cache = {};
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var resolve = require('resolve');

var rerequire = function (file, mocks, globals) {

  mocks = mocks || {};

  if (module.parent) {
    var absolute_path = resolve.sync(file, { basedir: path.dirname(module.parent.id) });
  }

  var default_globals = {

    require: function (mod) {
      var modulePath = resolve.sync(mod, { basedir: path.dirname(absolute_path) });
      return mocks[mod] || require(modulePath);
    },

    module: {
      exports: {}
    },

    console: console,

  };

  // Extend globals

  for (var i in globals) {
    if (globals.hasOwnProperty(i)) {
      default_globals[i] = globals[i];
    }
  }

  // Cache file content

  var content = cache[file] || (function () {
    cache[file] = fs.readFileSync(absolute_path, 'utf8');
    return cache[file];
  }());

  vm.runInNewContext(content, default_globals);

  return default_globals.module.exports;

};

module.exports = rerequire;

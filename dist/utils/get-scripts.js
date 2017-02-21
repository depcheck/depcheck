'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getScripts;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var scriptCache = {};

function getCacheOrFile(key, fn) {
  if (scriptCache[key]) {
    return scriptCache[key];
  }

  var value = fn();
  scriptCache[key] = value;

  return value;
}

var travisCommands = [
// Reference: http://docs.travis-ci.com/user/customizing-the-build/#The-Build-Lifecycle
'before_install', 'install', 'before_script', 'script', 'after_success or after_failure', 'before_deploy', 'after_deploy', 'after_script'];

function getScripts(filepath) {
  var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return getCacheOrFile(filepath, function () {
    var basename = _path2.default.basename(filepath);
    var fileContent = content !== null ? content : _fs2.default.readFileSync(filepath, 'utf-8');

    if (basename === 'package.json') {
      return _lodash2.default.values(JSON.parse(fileContent).scripts || {});
    } else if (basename === '.travis.yml') {
      var metadata = _jsYaml2.default.safeLoad(content) || {};
      return (0, _lodash2.default)(travisCommands).map(function (cmd) {
        return metadata[cmd] || [];
      }).flatten().value();
    }

    return [];
  });
}
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFerossStandard;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseFerossStandard(content, filePath, deps, rootDir) {
  var packageJsonPath = _path2.default.resolve(rootDir, 'package.json');
  var resolvedFilePath = _path2.default.resolve(filePath);
  if (resolvedFilePath === packageJsonPath && deps.indexOf('standard') !== -1) {
    var metadata = JSON.parse(content);
    var config = metadata.standard || {};
    var parser = config.parser;
    return parser ? [parser] : [];
  }

  return [];
}
module.exports = exports['default'];
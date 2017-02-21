'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseCommitizen;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _requirePackageName = require('require-package-name');

var _requirePackageName2 = _interopRequireDefault(_requirePackageName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseCommitizen(content, filePath, deps, rootDir) {
  var packageJsonPath = _path2.default.resolve(rootDir, 'package.json');
  var resolvedFilePath = _path2.default.resolve(filePath);

  if (resolvedFilePath === packageJsonPath) {
    var metadata = JSON.parse(content);

    if (metadata.config && metadata.config.commitizen && metadata.config.commitizen.path) {
      var commitizenPath = metadata.config.commitizen.path;

      if (!commitizenPath.startsWith('.')) {
        return [(0, _requirePackageName2.default)(commitizenPath)];
      }

      var normalizedPath = _path2.default.normalize(commitizenPath).replace(/\\/g, '/');

      if (!normalizedPath.startsWith('node_modules')) {
        // The path is not refering to a file in another module
        return [];
      }

      var packagePath = normalizedPath.substring('node_modules/'.length);

      return [(0, _requirePackageName2.default)(packagePath)];
    }
  }

  return [];
}
module.exports = exports['default'];
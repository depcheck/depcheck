'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseSASS;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _requirePackageName = require('require-package-name');

var _requirePackageName2 = _interopRequireDefault(_requirePackageName);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sass = (0, _utils.tryRequire)('node-sass');

function parseSASS(content, filePath, deps, rootDir) {
  var _sass$renderSync = sass.renderSync({
    data: content,
    includePaths: [_path2.default.dirname(filePath)]
  }),
      stats = _sass$renderSync.stats;

  var result = (0, _lodash2.default)(stats.includedFiles).map(function (file) {
    return _path2.default.relative(rootDir, file);
  }).filter(function (file) {
    return file.indexOf('node_modules') === 0;
  }) // refer to node_modules
  .map(function (file) {
    return file.replace(/\\/g, '/');
  }) // normalize paths in Windows
  .map(function (file) {
    return file.substring('node_modules/'.length);
  }) // avoid heading slash
  .map(_requirePackageName2.default).uniq().value();

  return result;
}
module.exports = exports['default'];
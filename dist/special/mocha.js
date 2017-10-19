'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseMocha;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _requirePackageName = require('require-package-name');

var _requirePackageName2 = _interopRequireDefault(_requirePackageName);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOpts(script) {
  var argvs = script.split(' ').filter(function (argv) {
    return argv;
  });
  var optsIndex = argvs.indexOf('--opts');
  return optsIndex !== -1 ? argvs[optsIndex + 1] : null;
}

function getRequires(content, deps) {
  return content.split('\n').map(function (line) {
    return line.trim();
  }).filter(function (line) {
    return line.indexOf('--require ') === 0;
  }).map(function (line) {
    return line.substring('--require '.length).trim();
  }).map(_requirePackageName2.default).filter(function (name) {
    return deps.indexOf(name) !== -1;
  });
}

function parseMocha(content, filepath, deps, rootDir) {
  var defaultOptPath = _path2.default.resolve(rootDir, 'test/mocha.opts');
  if (filepath === defaultOptPath) {
    return getRequires(content, deps);
  }

  // get mocha.opts from scripts
  var requires = (0, _lodash2.default)((0, _utils.getScripts)(filepath, content)).filter(function (script) {
    return script.indexOf('mocha') !== -1;
  }).map(function (script) {
    return getOpts(script);
  }).filter(function (opts) {
    return opts;
  }).map(function (opts) {
    return _path2.default.resolve(filepath, '..', opts);
  }).map(function (optPath) {
    return _fs2.default.readFileSync(optPath, 'utf-8');
  }) // TODO async read file
  .map(function (optContent) {
    return getRequires(optContent, deps);
  }).flatten().value();

  return requires;
}
module.exports = exports['default'];
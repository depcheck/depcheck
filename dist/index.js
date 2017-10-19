'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = depcheck;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _check = require('./check');

var _check2 = _interopRequireDefault(_check);

var _utils = require('./utils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isIgnored(ignoreMatches, dependency) {
  var match = _lodash2.default.partial(_minimatch2.default, dependency);
  return ignoreMatches.some(match);
}

function hasBin(rootDir, dependency) {
  try {
    var metadata = (0, _utils.readJSON)(_path2.default.join(rootDir, 'node_modules', dependency, 'package.json'));
    return {}.hasOwnProperty.call(metadata, 'bin');
  } catch (error) {
    return false;
  }
}

function filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies) {
  return (0, _lodash2.default)(dependencies).keys().reject(function (dep) {
    return isIgnored(ignoreMatches, dep) || ignoreBinPackage && hasBin(rootDir, dep);
  }).value();
}

function depcheck(rootDir, options, callback) {
  var getOption = function getOption(key) {
    return _lodash2.default.isUndefined(options[key]) ? _constants.defaultOptions[key] : options[key];
  };

  var withoutDev = getOption('withoutDev');
  var ignoreBinPackage = getOption('ignoreBinPackage');
  var ignoreMatches = getOption('ignoreMatches');
  var ignoreDirs = _lodash2.default.union(_constants.defaultOptions.ignoreDirs, options.ignoreDirs);

  var detectors = getOption('detectors');
  var parsers = (0, _lodash2.default)(getOption('parsers')).mapValues(function (value) {
    return _lodash2.default.isArray(value) ? value : [value];
  }).merge({ '*': getOption('specials') }).value();

  var metadata = options.package || (0, _utils.readJSON)(_path2.default.join(rootDir, 'package.json'));
  var dependencies = metadata.dependencies || {};
  var devDependencies = !withoutDev && metadata.devDependencies ? metadata.devDependencies : {};
  var peerDeps = Object.keys(metadata.peerDependencies || {});
  var optionalDeps = Object.keys(metadata.optionalDependencies || {});
  var deps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies);
  var devDeps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, devDependencies);

  return (0, _check2.default)({
    rootDir: rootDir,
    ignoreDirs: ignoreDirs,
    deps: deps,
    devDeps: devDeps,
    peerDeps: peerDeps,
    optionalDeps: optionalDeps,
    parsers: parsers,
    detectors: detectors
  }).then(function (results) {
    return _extends(results, {
      missing: _lodash2.default.pick(results.missing, filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, results.missing))
    });
  }).then(callback);
}

depcheck.parser = _constants.availableParsers;
depcheck.detector = _constants.availableDetectors;
depcheck.special = _constants.availableSpecials;
module.exports = exports['default'];
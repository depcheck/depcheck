'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _deprecate = require('deprecate');

var _deprecate2 = _interopRequireDefault(_deprecate);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkPathExist(dir, errorMessage) {
  return new Promise(function (resolve, reject) {
    return _fs2.default.exists(dir, function (result) {
      return result ? resolve() : reject(errorMessage);
    });
  });
}

function getParsers(parsers) {
  return _lodash2.default.isUndefined(parsers) ? undefined : (0, _lodash2.default)(parsers).split(',').map(function (keyValuePair) {
    return keyValuePair.split(':');
  }).fromPairs().mapValues(function (value) {
    return value.split('&').map(function (name) {
      return _index2.default.parser[name];
    });
  }).value();
}

function getDetectors(detectors) {
  return _lodash2.default.isUndefined(detectors) ? undefined : detectors.split(',').map(function (name) {
    return _index2.default.detector[name];
  });
}

function getSpecials(specials) {
  return _lodash2.default.isUndefined(specials) ? undefined : specials.split(',').map(function (name) {
    return _index2.default.special[name];
  });
}

function noIssue(result) {
  return _lodash2.default.isEmpty(result.dependencies) && _lodash2.default.isEmpty(result.devDependencies) && _lodash2.default.isEmpty(result.missing);
}

function prettify(caption, deps) {
  var list = deps.map(function (dep) {
    return '* ' + dep;
  });
  return list.length ? [caption].concat(list) : [];
}

function print(result, log, json) {
  if (json) {
    log(JSON.stringify(result, function (key, value) {
      return _lodash2.default.isError(value) ? value.stack : value;
    }));
  } else if (noIssue(result)) {
    log('No depcheck issue');
  } else {
    var deps = prettify('Unused dependencies', result.dependencies);
    var devDeps = prettify('Unused devDependencies', result.devDependencies);
    var missing = prettify('Missing dependencies', Object.keys(result.missing));
    var content = deps.concat(devDeps, missing).join('\n');
    log(content);
  }

  return result;
}

function checkDeprecation(argv) {
  if (argv.dev === false) {
    (0, _deprecate2.default)('The option `dev` is deprecated. It leads a wrong result for missing dependencies' + ' when it is `false`. This option will be removed and enforced to `true` in next' + ' major version.');
  }
}

function cli(args, log, error, exit) {
  var opt = (0, _yargs2.default)(args).usage('Usage: $0 [DIRECTORY]').boolean(['dev', 'ignore-bin-package']).default({
    dev: true,
    'ignore-bin-package': false
  }).describe('dev', '[DEPRECATED] Check on devDependecies').describe('ignore-bin-package', 'Ignore package with bin entry').describe('json', 'Output results to JSON').describe('ignores', 'Comma separated package list to ignore').describe('ignore-dirs', 'Comma separated folder names to ignore').describe('parsers', 'Comma separated glob:parser pair list').describe('detectors', 'Comma separated detector list').describe('specials', 'Comma separated special parser list').version('version', 'Show version number', _package.version).help('help', 'Show this help message');

  checkDeprecation(opt.argv);

  var dir = opt.argv._[0] || '.';
  var rootDir = _path2.default.resolve(dir);

  checkPathExist(rootDir, 'Path ' + dir + ' does not exist').then(function () {
    return checkPathExist(_path2.default.resolve(rootDir, 'package.json'), 'Path ' + dir + ' does not contain a package.json file');
  }).then(function () {
    return (0, _index2.default)(rootDir, {
      withoutDev: !opt.argv.dev,
      ignoreBinPackage: opt.argv.ignoreBinPackage,
      ignoreMatches: (opt.argv.ignores || '').split(','),
      ignoreDirs: (opt.argv.ignoreDirs || '').split(','),
      parsers: getParsers(opt.argv.parsers),
      detectors: getDetectors(opt.argv.detectors),
      specials: getSpecials(opt.argv.specials)
    });
  }).then(function (result) {
    return print(result, log, opt.argv.json);
  }).then(function (_ref) {
    var deps = _ref.dependencies,
        devDeps = _ref.devDependencies;
    return exit(opt.argv.json || (deps.length === 0 && devDeps.length) === 0 ? 0 : -1);
  }).catch(function (errorMessage) {
    error(errorMessage);
    exit(-1);
  });
}
module.exports = exports['default'];
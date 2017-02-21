'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = exports.availableSpecials = exports.availableDetectors = exports.availableParsers = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _component = require('./component.json');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function constructComponent(source, name) {
  return (0, _lodash2.default)(source[name]).map(function (file) {
    return [file, require(_path2.default.resolve(__dirname, name, file))];
  }).fromPairs().value();
}

var availableParsers = exports.availableParsers = constructComponent(_component2.default, 'parser');

var availableDetectors = exports.availableDetectors = constructComponent(_component2.default, 'detector');

var availableSpecials = exports.availableSpecials = constructComponent(_component2.default, 'special');

var defaultOptions = exports.defaultOptions = {
  withoutDev: false,
  ignoreBinPackage: false,
  ignoreMatches: [],
  ignoreDirs: ['.git', '.svn', '.hg', '.idea', 'node_modules', 'bower_components'],
  parsers: {
    '*.js': availableParsers.jsx,
    '*.jsx': availableParsers.jsx,
    '*.coffee': availableParsers.coffee,
    '*.litcoffee': availableParsers.coffee,
    '*.coffee.md': availableParsers.coffee,
    '*.ts': availableParsers.typescript,
    '*.tsx': availableParsers.typescript,
    '*.sass': availableParsers.sass,
    '*.scss': availableParsers.sass
  },
  detectors: [availableDetectors.importDeclaration, availableDetectors.requireCallExpression, availableDetectors.requireResolveCallExpression, availableDetectors.importCallExpression, availableDetectors.gruntLoadTaskCallExpression],
  specials: _lodash2.default.values(availableSpecials)
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseWebpack;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpackConfigRegex = /webpack(\..+)?\.config\.(babel\.)?js/;
var loaderTemplates = ['*-webpack-loader', '*-web-loader', '*-loader', '*'];

function extractLoaders(item) {
  if (item.loader) {
    return item.loader.split('!');
  } else if (item.loaders) {
    return item.loaders;
  }

  return [];
}

function stripQueryParameter(loader) {
  var index = loader.indexOf('?');
  return index === -1 ? loader : loader.substring(0, index);
}

function normalizeLoader(deps, loader) {
  var name = (0, _lodash2.default)(loaderTemplates).map(function (template) {
    return template.replace('*', loader);
  }).intersection(deps).first();

  return name;
}

function getLoaders(deps, loaders) {
  return (0, _lodash2.default)(loaders || []).map(extractLoaders).flatten().map(function (loader) {
    return stripQueryParameter(loader);
  }).map(function (loader) {
    return normalizeLoader(deps, loader);
  }).filter(function (loader) {
    return loader;
  }).uniq().value();
}

function parseWebpack(content, filepath, deps) {
  var filename = _path2.default.basename(filepath);
  if (webpackConfigRegex.test(filename)) {
    var module = require(filepath).module || {}; // eslint-disable-line global-require
    var loaders = getLoaders(deps, module.loaders);
    var preLoaders = getLoaders(deps, module.preLoaders);
    var postLoaders = getLoaders(deps, module.postLoaders);
    return loaders.concat(preLoaders).concat(postLoaders);
  }

  return [];
}
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseESLint;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _requirePackageName = require('require-package-name');

var _requirePackageName2 = _interopRequireDefault(_requirePackageName);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    // not JSON format
  }

  try {
    return _jsYaml2.default.safeLoad(content);
  } catch (error) {
    // not YAML format
  }

  try {
    return (0, _utils.evaluate)('module.exports = ' + content);
  } catch (error) {}
  // not valid JavaScript code


  // parse fail, return nothing
  return {};
}

function wrapToArray(obj) {
  if (!obj) {
    return [];
  } else if (_lodash2.default.isArray(obj)) {
    return obj;
  }

  return [obj];
}

function isEslintConfigAnAbsolutePath(specifier) {
  return _path2.default.isAbsolute(specifier);
}

function isEslintConfigARelativePath(specifier) {
  return _lodash2.default.startsWith(specifier, './') || _lodash2.default.startsWith(specifier, '../');
}

function isEslintConfigAScopedModule(specifier) {
  return _lodash2.default.startsWith(specifier, '@');
}

function isEslintConfigAFullyQualifiedModuleName(specifier) {
  return _lodash2.default.startsWith(specifier, 'eslint-config-');
}

function resolvePresetPackage(preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (isEslintConfigAnAbsolutePath(preset)) {
    return preset;
  }
  if (isEslintConfigARelativePath(preset)) {
    return _path2.default.resolve(rootDir, preset);
  }
  if (isEslintConfigAScopedModule(preset)) {
    var scope = preset.substring(0, preset.indexOf('/'));
    var module = preset.substring(preset.indexOf('/') + 1);

    if (isEslintConfigAFullyQualifiedModuleName(module)) {
      return preset;
    }
    return scope + '/eslint-config-' + module;
  }
  if (isEslintConfigAFullyQualifiedModuleName(preset)) {
    return preset;
  }
  return 'eslint-config-' + preset;
}

function loadConfig(preset, rootDir) {
  var presetPath = _path2.default.isAbsolute(preset) ? preset : _path2.default.resolve(rootDir, 'node_modules', preset);

  try {
    return require(presetPath); // eslint-disable-line global-require
  } catch (error) {
    return {}; // silently return nothing
  }
}

function checkConfig(config, rootDir) {
  var parser = wrapToArray(config.parser);
  var plugins = wrapToArray(config.plugins).map(function (plugin) {
    return 'eslint-plugin-' + plugin;
  });

  var presets = wrapToArray(config.extends).filter(function (preset) {
    return preset !== 'eslint:recommended';
  }).map(function (preset) {
    return resolvePresetPackage(preset, rootDir);
  });

  var presetPackages = presets.filter(function (preset) {
    return !_path2.default.isAbsolute(preset);
  }).map(_requirePackageName2.default);

  var presetDeps = (0, _lodash2.default)(presets).map(function (preset) {
    return loadConfig(preset, rootDir);
  }).map(function (presetConfig) {
    return checkConfig(presetConfig, rootDir);
  }).flatten().value();

  return _lodash2.default.union(parser, plugins, presetPackages, presetDeps);
}

function parseESLint(content, filename, deps, rootDir) {
  var basename = _path2.default.basename(filename);
  if (/^\.eslintrc(\.json|\.js|\.yml|\.yaml)?$/.test(basename)) {
    var config = parse(content);
    return checkConfig(config, rootDir);
  }

  return [];
}
module.exports = exports['default'];
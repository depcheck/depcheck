'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseGulpPlugins;

var _path = require('path');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _es = require('../parser/es7');

var _es2 = _interopRequireDefault(_es);

var _importDeclaration = require('../detector/importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

var _requireCallExpression = require('../detector/requireCallExpression');

var _requireCallExpression2 = _interopRequireDefault(_requireCallExpression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getPluginLookup(deps) {
  var patterns = ['gulp-*', 'gulp.*', '@*/gulp{-,.}*'];
  var lookup = (0, _lodash2.default)(deps).filter(function (dep) {
    return patterns.some(function (pattern) {
      return (0, _minimatch2.default)(dep, pattern);
    });
  }).map(function (dep) {
    var isScoped = dep[0] === '@';
    var scopedParts = dep.substring(1).split('/');
    var scope = isScoped ? scopedParts[0] : '';
    var plugin = isScoped ? scopedParts[1] : dep;
    var variableName = _lodash2.default.camelCase(plugin.substring('gulp-'.length));
    var memberName = isScoped ? '.' + scope + '.' + variableName : '.' + variableName;
    return [memberName, dep];
  }).fromPairs().value();

  return lookup;
}

/**
 * Get the references to the variable in the path scope.
 * @example Within the path scope, returns references to `loadPlugins` variable.
 */
function getReferences(path, variableName) {
  var bindings = path.scope.getBinding(variableName);
  var references = bindings.referencePaths;
  return references;
}

/**
 * Get the variable name from the variable assigned declaration.
 * @example With code `$ = loadPlugins()` and `loadPlugins` as path, returns the string `$`.
 */
function getIdentifierVariableName(path) {
  if (path.isIdentifier() && path.parentPath.isCallExpression() && path.parentPath.parentPath.isVariableDeclarator()) {
    var variableName = path.parentPath.parentPath.node.id.name;
    return variableName;
  }

  return '';
}

/**
 * Get the identifier references from imported/required load-plugin variable name.
 * @example With code `a = plugins(), b = plugins()`, returns uasge references to `a` and `b`.
 */
function getIdentifierReferences(path, loadPluginsVariableName) {
  var requireReferences = getReferences(path, loadPluginsVariableName);

  var identifierReferences = (0, _lodash2.default)(requireReferences).map(getIdentifierVariableName).filter().map(function (identifierVariableName) {
    return getReferences(path, identifierVariableName);
  }).flatten().value();

  return identifierReferences;
}

/**
 * Get the package name from the identifier call path.
 * @example With code `$.jshint()` and `$` as path, returns `gulp-jshint` string.
 */
function getPackageName(content, pluginLookup, identifierPath) {
  var memberPath = identifierPath.parentPath;
  while (memberPath.isMemberExpression()) {
    var code = content.slice(identifierPath.node.end, memberPath.node.end);
    var pluginName = pluginLookup[code];
    if (pluginName) {
      return pluginName;
    }

    memberPath = memberPath.parentPath;
  }

  return '';
}

/**
 * Get the gulp packages found from the path. This is the entry for traverse.
 */
function check(content, deps, path) {
  if (
  // Pattern: import plugins from 'gulp-load-plugins', $ = plugins(), $.jshint()
  (0, _importDeclaration2.default)(path.node)[0] === 'gulp-load-plugins' && path.isImportDeclaration() && path.get('specifiers')[0] && path.get('specifiers')[0].isImportDefaultSpecifier() && path.get('specifiers')[0].get('local').isIdentifier()) {
    var importVariableName = path.get('specifiers')[0].get('local').node.name;
    var identifierReferences = getIdentifierReferences(path, importVariableName);
    var packageNames = identifierReferences.map(function (r) {
      return getPackageName(content, deps, r);
    });
    return packageNames;
  } else if (

  // Pattern: plugins = require('gulp-load-plugins'), $ = plugins(), $.jshint()
  (0, _requireCallExpression2.default)(path.node)[0] === 'gulp-load-plugins' && path.isCallExpression() && path.parentPath.isVariableDeclarator() && path.parentPath.get('id').isIdentifier()) {
    var requireVariableName = path.parentPath.get('id').node.name;
    var _identifierReferences = getIdentifierReferences(path, requireVariableName);
    var _packageNames = _identifierReferences.map(function (r) {
      return getPackageName(content, deps, r);
    });
    return _packageNames;
  } else if (

  // Pattern: $ = require('gulp-load-plugins')(), $.jshint()
  (0, _requireCallExpression2.default)(path.node)[0] === 'gulp-load-plugins' && path.isCallExpression() && path.parentPath.isCallExpression() && path.parentPath.parentPath.isVariableDeclarator() && path.parentPath.parentPath.get('id').isIdentifier()) {
    var _requireVariableName = path.parentPath.parentPath.get('id').node.name;
    var _identifierReferences2 = getReferences(path, _requireVariableName);
    var _packageNames2 = _identifierReferences2.map(function (r) {
      return getPackageName(content, deps, r);
    });
    return _packageNames2;
  } else if (

  // Pattern: require('gulp-load-plugins')().thisPlugin()
  (0, _requireCallExpression2.default)(path.node)[0] === 'gulp-load-plugins' && path.isCallExpression() && path.parentPath.isCallExpression() && path.parentPath.parentPath.isMemberExpression()) {
    var packageName = getPackageName(content, deps, path.parentPath);
    return [packageName];
  }

  return [];
}

function parseGulpPlugins(content, filePath, deps, rootDir) {
  var resolvedPath = (0, _path.resolve)(filePath);
  if (resolvedPath !== (0, _path.resolve)(rootDir, 'gulpfile.js') && resolvedPath !== (0, _path.resolve)(rootDir, 'gulpfile.babel.js')) {
    return [];
  }

  var pluginLookup = getPluginLookup(deps);
  var ast = (0, _es2.default)(content);
  var results = [];
  (0, _babelTraverse2.default)(ast, {
    enter: function enter(path) {
      results.push.apply(results, _toConsumableArray(check(content, pluginLookup, path)));
    }
  });

  return (0, _lodash2.default)(results).filter().uniq().value();
}
module.exports = exports['default'];
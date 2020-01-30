import { resolve } from 'path';
import lodash from 'lodash';
import minimatch from 'minimatch';
import traverse from '@babel/traverse';

import { parseES7Content } from '../parser/es7';
import importDetector from '../detector/importDeclaration';
import requireDetector from '../detector/requireCallExpression';
import { getContent } from '../utils/file';

function getPluginLookup(deps) {
  const patterns = ['gulp-*', 'gulp.*', '@*/gulp{-,.}*'];
  const lookup = lodash(deps)
    .filter((dep) => patterns.some((pattern) => minimatch(dep, pattern)))
    .map((dep) => {
      const isScoped = dep[0] === '@';
      const scopedParts = dep.substring(1).split('/');
      const scope = isScoped ? scopedParts[0] : '';
      const plugin = isScoped ? scopedParts[1] : dep;
      const variableName = lodash.camelCase(plugin.substring('gulp-'.length));
      const memberName = isScoped
        ? `.${scope}.${variableName}`
        : `.${variableName}`;
      return [memberName, dep];
    })
    .fromPairs()
    .value();

  return lookup;
}

/**
 * Get the references to the variable in the path scope.
 * @example Within the path scope, returns references to `loadPlugins` variable.
 */
function getReferences(path, variableName) {
  const bindings = path.scope.getBinding(variableName);
  const references = bindings.referencePaths;
  return references;
}

/**
 * Get the variable name from the variable assigned declaration.
 * @example With code `$ = loadPlugins()` and `loadPlugins` as path, returns the string `$`.
 */
function getIdentifierVariableName(path) {
  if (
    path.isIdentifier() &&
    path.parentPath.isCallExpression() &&
    path.parentPath.parentPath.isVariableDeclarator()
  ) {
    const variableName = path.parentPath.parentPath.node.id.name;
    return variableName;
  }

  return '';
}

/**
 * Get the identifier references from imported/required load-plugin variable name.
 * @example With code `a = plugins(), b = plugins()`, returns uasge references to `a` and `b`.
 */
function getIdentifierReferences(path, loadPluginsVariableName) {
  const requireReferences = getReferences(path, loadPluginsVariableName);

  const identifierReferences = lodash(requireReferences)
    .map(getIdentifierVariableName)
    .filter()
    .map((identifierVariableName) =>
      getReferences(path, identifierVariableName),
    )
    .flatten()
    .value();

  return identifierReferences;
}

/**
 * Get the package name from the identifier call path.
 * @example With code `$.jshint()` and `$` as path, returns `gulp-jshint` string.
 */
function getPackageName(content, pluginLookup, identifierPath) {
  let memberPath = identifierPath.parentPath;
  while (memberPath.isMemberExpression()) {
    const code = content.slice(identifierPath.node.end, memberPath.node.end);
    const pluginName = pluginLookup[code];
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
    importDetector(path.node)[0] === 'gulp-load-plugins' &&
    path.isImportDeclaration() &&
    path.get('specifiers')[0] &&
    path.get('specifiers')[0].isImportDefaultSpecifier() &&
    path
      .get('specifiers')[0]
      .get('local')
      .isIdentifier()
  ) {
    const importVariableName = path.get('specifiers')[0].get('local').node.name;
    const identifierReferences = getIdentifierReferences(
      path,
      importVariableName,
    );
    const packageNames = identifierReferences.map((r) =>
      getPackageName(content, deps, r),
    );
    return packageNames;
  }
  if (
    // Pattern: plugins = require('gulp-load-plugins'), $ = plugins(), $.jshint()
    requireDetector(path.node)[0] === 'gulp-load-plugins' &&
    path.isCallExpression() &&
    path.parentPath.isVariableDeclarator() &&
    path.parentPath.get('id').isIdentifier()
  ) {
    const requireVariableName = path.parentPath.get('id').node.name;
    const identifierReferences = getIdentifierReferences(
      path,
      requireVariableName,
    );
    const packageNames = identifierReferences.map((r) =>
      getPackageName(content, deps, r),
    );
    return packageNames;
  }
  if (
    // Pattern: $ = require('gulp-load-plugins')(), $.jshint()
    requireDetector(path.node)[0] === 'gulp-load-plugins' &&
    path.isCallExpression() &&
    path.parentPath.isCallExpression() &&
    path.parentPath.parentPath.isVariableDeclarator() &&
    path.parentPath.parentPath.get('id').isIdentifier()
  ) {
    const requireVariableName = path.parentPath.parentPath.get('id').node.name;
    const identifierReferences = getReferences(path, requireVariableName);
    const packageNames = identifierReferences.map((r) =>
      getPackageName(content, deps, r),
    );
    return packageNames;
  }
  if (
    // Pattern: require('gulp-load-plugins')().thisPlugin()
    requireDetector(path.node)[0] === 'gulp-load-plugins' &&
    path.isCallExpression() &&
    path.parentPath.isCallExpression() &&
    path.parentPath.parentPath.isMemberExpression()
  ) {
    const packageName = getPackageName(content, deps, path.parentPath);
    return [packageName];
  }

  return [];
}

export default async function parseGulpPlugins(filename, deps, rootDir) {
  const resolvedPath = resolve(filename);
  if (
    resolvedPath !== resolve(rootDir, 'gulpfile.js') &&
    resolvedPath !== resolve(rootDir, 'gulpfile.babel.js')
  ) {
    return [];
  }

  const pluginLookup = getPluginLookup(deps);
  const content = await getContent(filename);
  const ast = await parseES7Content(content);
  const results = [];
  traverse(ast, {
    enter(path) {
      results.push(...check(content, pluginLookup, path));
    },
  });

  return lodash(results)
    .filter()
    .uniq()
    .value();
}

import { resolve } from 'path';
import lodash from 'lodash';
import traverse from 'babel-traverse';

import esParser from '../parser/es7';
import importDetector from '../detector/importDeclaration';
import requireDetector from '../detector/requireCallExpression';

/**
 * Get the variable name for the imported package.
 * @example With code `import loadPlugins from 'x'`, returns the 'loadPlugins' string.
 */
function getImportVariableName(path) {
  // check if import the default exported value
  const [importDefaultSpecifier] = path.get('specifiers');
  if (!importDefaultSpecifier.isImportDefaultSpecifier()) {
    return [];
  }

  // get the identifier path
  const identifier = importDefaultSpecifier.get('local');
  if (!identifier.isIdentifier()) {
    return [];
  }

  const variableName = identifier.node.name;
  return variableName;
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
 * Get all the reference paths to the assigned variable.
 * @example With code `$=loadPlugins()`, returns references to `$` variable.
 */
function getIdentifierReferences(path) {
  if (
    path.isIdentifier() &&
    path.parentPath.isCallExpression() &&
    path.parentPath.parentPath.isVariableDeclarator()
  ) {
    const idName = path.parentPath.parentPath.node.id.name;
    const binding = path.scope.getBinding(idName);
    const references = binding.referencePaths;

    return references;
  }

  return [];
}

/**
 * Find the comprehensive member expression for the identifier variableName.
 * @example With code `$.call.a.function()`, returns `$.call.a.function` string.
 */
function findMemberExpression(path) {
  if (!path.isIdentifier()) {
    return '';
  }

  const expression = findMemberExpression.recurse(path);
  return expression;
}

findMemberExpression.recurse = (path) =>
  (!path.parentPath.isMemberExpression()
    ? path
    : findMemberExpression.recurse(path.parentPath));

/**
 * Convert the gulp plugin call to corresponding npm package names
 * @example With string `$.that.plugin`, returns `@that/gulp-plugin` as package name.
 */
function convertToPackageName(code, deps) {
  const parts = code.split('.');
  if (parts.length === 2) { // $.jshint
    const name = lodash.kebabCase(parts[1]);
    const candidates = [`gulp-${name}`, `gulp.${name}`];
    const dep = lodash.intersection(candidates, deps)[0];
    return dep;
  } else if (parts.length === 3) { // $.scope.plugin
    const scope = parts[1];
    const name = lodash.kebabCase(parts[2]);
    return `@${scope}/gulp-${name}`; // TODO logic not right
  }

  return '';
}

export default function parseGulpPlugins(content, filePath, deps, rootDir) {
  const gulpfilePath = resolve(rootDir, 'gulpfile.js');
  const resolvedPath = resolve(filePath);
  if (resolvedPath !== gulpfilePath) {
    return [];
  }

  const ast = esParser(content);
  const results = [];

  traverse(ast, {
    enter(path) {
      const [importPackage] = importDetector(path.node);
      const [requirePackage] = requireDetector(path.node);

      // check if import from 'gulp-load-plugins'
      if (importPackage === 'gulp-load-plugins') {
        const importVariableName = getImportVariableName(path);
        const importReferences = getReferences(path, importVariableName);
        const identifierReferences = lodash(importReferences)
          .map(getIdentifierReferences)
          .flatten()
          .value();

        identifierReferences.forEach(reference => {
          const memberExpression = findMemberExpression(reference);
          const code = content.slice(memberExpression.node.start, memberExpression.node.end);
          const packageName = convertToPackageName(code, deps);
          results.push(packageName);
        });
      }

      // check if require gulp-load-plugins package
      if (requirePackage === 'gulp-load-plugins') {
        if (
          path.parentPath.isVariableDeclarator() &&
          path.parentPath.get('id').isIdentifier()
        ) {
          // Pattern: const plugins = require('gulp-load-plugins')
          const requireVariableName = path.parentPath.get('id').node.name;
          const requireReferences = getReferences(path, requireVariableName);

          // TODO the following code is copied from import part. Refactor the code.
          const identifierReferences = lodash(requireReferences)
            .map(getIdentifierReferences)
            .flatten()
            .value();

          identifierReferences.forEach(reference => {
            const memberExpression = findMemberExpression(reference);
            const code = content.slice(memberExpression.node.start, memberExpression.node.end);
            const packageName = convertToPackageName(code, deps);
            results.push(packageName);
          });
        } else if (
          path.parentPath.isCallExpression() &&
          path.parentPath.parentPath.isVariableDeclarator() &&
          path.parentPath.parentPath.get('id').isIdentifier()
        ) {
          // Pattern: const $ = require('gulp-load-plugins')()
          const requireVariableName = path.parentPath.parentPath.get('id').node.name;

          // TODO copy from getIdentifierReferences, may avoid duplicate.
          const binding = path.scope.getBinding(requireVariableName);
          const identifierReferences = binding.referencePaths;

          // TODO refactor to avoid duplicate.
          identifierReferences.forEach(reference => {
            const memberExpression = findMemberExpression(reference);
            const code = content.slice(memberExpression.node.start, memberExpression.node.end);
            const packageName = convertToPackageName(code, deps);
            results.push(packageName);
          });
        } else if (
          path.parentPath.isCallExpression() &&
          path.parentPath.parentPath.isMemberExpression()
        ) {
          // Pattern: require('gulp-load-plugins')().thisPlugin()
          const identifierExpression = path.parentPath;
          const memberExpression = path.parentPath.parentPath;

          // Skip the `require('gulp-load-plugins')()` blob.
          const code = content.slice(identifierExpression.node.end, memberExpression.node.end);
          const packageName = convertToPackageName(code, deps);
          results.push(packageName);
        }
      }
    },
  });

  return lodash(results).filter(name => name).uniq().value();
}

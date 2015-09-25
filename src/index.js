import fs from 'fs';
import path from 'path';
import Walker from 'node-source-walk';
import walkdir from 'walkdir';
import _ from 'lodash';
import minimatch from 'minimatch';
import defaultParser from './parsers/default';
import gruntLoadTaskDetector from './detectors/gruntLoadTaskCallExpression';
import importDetector from './detectors/importDeclaration';
import requireDetector from './detectors/requireCallExpression';

function safeDetect(detector, node) {
  try {
    return detector(node);
  } catch (e) {
    return [];
  }
}

function getDependencies(parsers, detectors, filename) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filename);
    const parser = parsers[ext];

    if (parser) {
      fs.readFile(filename, 'utf8', (error, content) => {
        if (error) {
          reject(error);
        }

        try {
          const ast = parser(content);
          resolve(ast);
        } catch (syntaxError) {
          reject(syntaxError);
        }
      });
    } else {
      resolve(); // extension not supported
    }
  }).then(ast => {
    if (!ast) {
      return []; // unsupported extension return no dependencies
    }

    const walker = new Walker();
    let dependencies = [];

    walker.walk(ast, node => {
      const results = detectors.map(detector => safeDetect(detector, node));
      dependencies = dependencies.concat(...results);
    });

    return dependencies;
  });
}

function checkDirectory(dir, ignoreDirs, deps, devDeps, parsers, detectors) {
  return new Promise(resolve => {
    const promises = [];
    const finder = walkdir(dir, { 'no_recurse': true });

    finder.on('directory', subdir =>
      ignoreDirs.includes(path.basename(subdir))
      ? null
      : promises.push(
          checkDirectory(subdir, ignoreDirs, deps, devDeps, parsers, detectors)));

    finder.on('file', filename =>
      promises.push(getDependencies(parsers, detectors, filename)
        .then(dependencies =>
          dependencies.map(dependency =>
            dependency.replace ? dependency.replace(/\/.*$/, '') : dependency))
        .then(used => ({
          dependencies: _.difference(deps, used),
          devDependencies: _.difference(devDeps, used),
        }), error => ({
          dependencies: deps,
          devDependencies: devDeps,
          invalidFiles: {
            [filename]: error,
          },
        }))));

    finder.on('end', () =>
      resolve(Promise.all(promises).then(results =>
        results.reduce((obj, current) => ({
          dependencies: _.intersection(obj.dependencies, current.dependencies),
          devDependencies: _.intersection(obj.devDependencies, current.devDependencies),
          invalidFiles: _.merge(obj.invalidFiles, current.invalidFiles, {}),
          invalidDirs: _.merge(obj.invalidDirs, current.invalidDirs, {}),
        }), {
          dependencies: deps,
          devDependencies: devDeps,
          invalidFiles: {},
          invalidDirs: {},
        }))));

    finder.on('error', (dirPath, error) =>
      promises.push(Promise.resolve({
        dependencies: deps,
        devDependencies: devDeps,
        invalidDirs: {
          [dirPath]: error,
        },
      })));
  });
}

function isIgnored(ignoreMatches, dependency) {
  return _.any(ignoreMatches, match => {
    return minimatch(dependency, match);
  });
}

function hasBin(rootDir, dependency) {
  try {
    const depPkg = require(path.join(rootDir, 'node_modules', dependency, 'package.json'));
    return _.has(depPkg, 'bin');
  } catch (e) {
    return false;
  }
}

function filterDependencies(rootDir, ignoreMatches, dependencies) {
  return _(dependencies)
    .keys()
    .reject(dependency => hasBin(rootDir, dependency))
    .reject(dependency => isIgnored(ignoreMatches, dependency))
    .valueOf();
}

function depCheck(rootDir, options, cb) {
  const pkg = options.package || require(path.join(rootDir, 'package.json'));
  const deps = filterDependencies(rootDir, options.ignoreMatches, pkg.dependencies);
  const devDeps = filterDependencies(rootDir, options.ignoreMatches, options.withoutDev ? [] : pkg.devDependencies);

  const ignoreDirs =
    _([
      '.git',
      '.svn',
      '.hg',
      '.idea',
      'node_modules',
      'bower_components',
    ])
    .concat(options.ignoreDirs)
    .flatten()
    .unique()
    .valueOf();

  const parsers = {
    '.js': defaultParser,
  };

  const detectors = [
    importDetector,
    requireDetector,
    gruntLoadTaskDetector,
  ];

  return checkDirectory(rootDir, ignoreDirs, deps, devDeps, parsers, detectors)
    .then(cb);
}

module.exports = depCheck;

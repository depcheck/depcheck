import fs from 'fs';
import path from 'path';
import Walker from 'node-source-walk';
import q from 'q';
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

function checkDirectory(dir, ignoreDirs, deps, devDeps) {
  const deferred = q.defer();
  const directoryPromises = [];
  const finder = walkdir(dir, { 'no_recurse': true });

  let invalidFiles = {};
  let invalidDirs = {};

  let unusedDeps = deps;
  let unusedDevDeps = devDeps;

  if (_.isEmpty(unusedDeps) && _.isEmpty(unusedDevDeps)) {
    finder.emit('end');
  }

  finder.on('directory', subdir => {
    if (_.contains(ignoreDirs, path.basename(subdir)))  {
      return;
    }

    directoryPromises.push(checkDirectory(subdir, ignoreDirs, unusedDeps, unusedDevDeps));
  });

  finder.on('file', filename => {
    const parsers = {
      '.js': defaultParser,
    };

    const detectors = [
      importDetector,
      requireDetector,
      gruntLoadTaskDetector,
    ];

    const promise = getDependencies(parsers, detectors, filename)
      .then(dependencies => {
        const used = dependencies.map(dependency =>
          dependency.replace ? dependency.replace(/\/.*$/, '') : dependency);
        return {
          dependencies: _.difference(unusedDeps, used),
          devDependencies: _.difference(unusedDevDeps, used),
        };
      }, error => ({
        dependencies: unusedDeps,
        devDependencies: unusedDevDeps,
        invalidFiles: {
          [filename]: error,
        },
      }));

    directoryPromises.push(promise);
  });

  finder.on('end', () => {
    deferred.resolve(q.allSettled(directoryPromises).then(directoryResults => {
      _.each(directoryResults, result => {
        if (result.state === 'fulfilled') {
          invalidFiles = _.merge(invalidFiles, result.value.invalidFiles, {});
          invalidDirs = _.merge(invalidDirs, result.value.invalidDirs, {});
          unusedDeps = _.intersection(unusedDeps, result.value.dependencies);
          unusedDevDeps = _.intersection(unusedDevDeps, result.value.devDependencies);
        } else {
          const dirPath = result.reason.dirPath;
          const error = result.reason.error;
          invalidDirs[dirPath] = error;
        }
      });

      return {
        dependencies: unusedDeps,
        devDependencies: unusedDevDeps,
        invalidFiles: invalidFiles,
        invalidDirs: invalidDirs,
      };
    }));
  });

  finder.on('error', (dirPath, err) => {
    directoryPromises.push(q.reject({
      dirPath: dirPath,
      error: err,
    }));
  });

  return deferred.promise;
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

  return checkDirectory(rootDir, ignoreDirs, deps, devDeps)
    .then(cb)
    .done();
}

module.exports = depCheck;

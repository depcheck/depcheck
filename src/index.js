import fs from 'fs';
import path from 'path';
import Walker from 'node-source-walk';
import walkdir from 'walkdir';
import minimatch from 'minimatch';
import component from './component';

function constructComponent(source, name) {
  return source[name].reduce((result, current) =>
    Object.assign(result, {
      [current]: require(path.resolve(__dirname, name, current)),
    }), {});
}

const availableParsers = constructComponent(component, 'parser');

const availableDetectors = constructComponent(component, 'detector');

const defaultOptions = {
  ignoreDirs: [
    '.git',
    '.svn',
    '.hg',
    '.idea',
    'node_modules',
    'bower_components',
  ],
  parsers: {
    '.js': availableParsers.es6,
    '.jsx': availableParsers.jsx,
  },
  detectors: [
    availableDetectors.importDeclaration,
    availableDetectors.requireCallExpression,
    availableDetectors.gruntLoadTaskCallExpression,
  ],
};

function safeDetect(detector, node) {
  try {
    return detector(node);
  } catch (error) {
    return [];
  }
}

function minus(array1, array2) {
  return array1.filter(item => array2.indexOf(item) === -1);
}

function intersect(array1, array2) {
  return array1.filter(item => array2.indexOf(item) !== -1);
}

function unique(array) {
  return array.filter((value, index) => array.indexOf(value) === index);
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
          resolve([ast]);
        } catch (syntaxError) {
          reject(syntaxError);
        }
      });
    } else {
      resolve([]); // extension not supported
    }
  }).then(asts => {
    const walker = new Walker();
    let dependencies = [];

    asts.forEach(ast =>
      walker.walk(ast, node => {
        const results = detectors.map(detector => safeDetect(detector, node));
        dependencies = dependencies.concat(...results);
      }));

    return dependencies;
  });
}

function checkDirectory(dir, ignoreDirs, deps, devDeps, parsers, detectors) {
  return new Promise(resolve => {
    const promises = [];
    const finder = walkdir(dir, { 'no_recurse': true });

    finder.on('directory', subdir =>
      ignoreDirs.indexOf(path.basename(subdir)) !== -1
      ? null
      : promises.push(
          checkDirectory(subdir, ignoreDirs, deps, devDeps, parsers, detectors)));

    finder.on('file', filename =>
      promises.push(getDependencies(parsers, detectors, filename)
        .then(dependencies =>
          dependencies.map(dependency =>
            dependency && dependency.replace
            ? dependency.replace(/\/.*$/, '')
            : dependency))
        .then(used => ({
          dependencies: minus(deps, used),
          devDependencies: minus(devDeps, used),
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
          dependencies: intersect(obj.dependencies, current.dependencies),
          devDependencies: intersect(obj.devDependencies, current.devDependencies),
          invalidFiles: Object.assign(obj.invalidFiles, current.invalidFiles),
          invalidDirs: Object.assign(obj.invalidDirs, current.invalidDirs),
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
  return ignoreMatches.some(match => minimatch(dependency, match));
}

function hasBin(rootDir, dependency) {
  try {
    const depPkg = require(path.join(rootDir, 'node_modules', dependency, 'package.json'));
    return depPkg.hasOwnProperty('bin');
  } catch (error) {
    return false;
  }
}

function filterDependencies(rootDir, ignoreMatches, dependencies) {
  return Object.keys(dependencies)
    .filter(dependency => !hasBin(rootDir, dependency))
    .filter(dependency => !isIgnored(ignoreMatches, dependency));
}

export default function depcheck(rootDir, options, cb) {
  const parsers = options.parsers || defaultOptions.parsers;
  const detectors = options.detectors || defaultOptions.detectors;
  const ignoreMatches = options.ignoreMatches || [];
  const ignoreDirs = unique(defaultOptions.ignoreDirs.concat(options.ignoreDirs));

  const metadata = options.package || require(path.join(rootDir, 'package.json'));
  const dependencies = metadata.dependencies || {};
  const devDependencies = metadata.devDependencies || {};
  const deps = filterDependencies(rootDir, ignoreMatches, dependencies);
  const devDeps = filterDependencies(rootDir, ignoreMatches, options.withoutDev ? [] : devDependencies);

  return checkDirectory(rootDir, ignoreDirs, deps, devDeps, parsers, detectors)
    .then(cb);
}

depcheck.parser = availableParsers;
depcheck.detector = availableDetectors;

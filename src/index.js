import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import walkdir from 'walkdir';
import minimatch from 'minimatch';
import builtInModules from 'builtin-modules';
import requirePackageName from 'require-package-name';

import component from './component';
import getNodes from './utils/get-nodes';
import discoverPropertyDep from './utils/discover-property-dep';

function constructComponent(source, name) {
  return lodash(source[name])
    .map(file => [
      file,
      require(path.resolve(__dirname, name, file)),
    ])
    .fromPairs()
    .value();
}

const availableParsers = constructComponent(component, 'parser');

const availableDetectors = constructComponent(component, 'detector');

const availableSpecials = constructComponent(component, 'special');

const defaultOptions = {
  withoutDev: false,
  ignoreBinPackage: false,
  ignoreMatches: [
  ],
  ignoreDirs: [
    '.git',
    '.svn',
    '.hg',
    '.idea',
    'node_modules',
    'bower_components',
  ],
  parsers: {
    '*.js': availableParsers.jsx,
    '*.jsx': availableParsers.jsx,
    '*.coffee': availableParsers.coffee,
    '*.litcoffee': availableParsers.coffee,
    '*.coffee.md': availableParsers.coffee,
  },
  detectors: [
    availableDetectors.importDeclaration,
    availableDetectors.requireCallExpression,
    availableDetectors.gruntLoadTaskCallExpression,
  ],
  specials: lodash.values(availableSpecials),
};

function isModule(dir) {
  try {
    require(path.resolve(dir, 'package.json'));
    return true;
  } catch (error) {
    return false;
  }
}

function mergeBuckets(object1, object2) {
  return lodash.mergeWith(object1, object2, (value1, value2) => {
    const array1 = value1 || [];
    const array2 = value2 || [];
    return array1.concat(array2);
  });
}

function detect(detectors, node) {
  return lodash(detectors)
    .map(detector => {
      try {
        return detector(node);
      } catch (error) {
        return [];
      }
    })
    .flatten()
    .value();
}

function getDependencies(dir, filename, deps, parser, detectors) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (error, content) => {
      if (error) {
        reject(error);
      }

      try {
        resolve(parser(content, filename, deps, dir));
      } catch (syntaxError) {
        reject(syntaxError);
      }
    });
  }).then(ast => {
    // when parser returns string array, skip detector step and treat them as dependencies directly.
    if (lodash.isArray(ast) && ast.every(lodash.isString)) {
      return ast;
    }

    const dependencies = lodash(getNodes(ast))
      .map(node => detect(detectors, node))
      .flatten()
      .uniq()
      .map(requirePackageName)
      .value();

    const discover = lodash.partial(discoverPropertyDep, dir, deps);
    const discoverPeerDeps = lodash.partial(discover, 'peerDependencies');
    const discoverOptionalDeps = lodash.partial(discover, 'optionalDependencies');
    const peerDeps = lodash(dependencies).map(discoverPeerDeps).flatten().value();
    const optionalDeps = lodash(dependencies).map(discoverOptionalDeps).flatten().value();

    return dependencies.concat(peerDeps).concat(optionalDeps);
  });
}

function checkFile(dir, filename, deps, parsers, detectors) {
  const basename = path.basename(filename);
  const targets = lodash(parsers)
    .keys()
    .filter(glob => minimatch(basename, glob, { dot: true }))
    .map(key => parsers[key])
    .flatten()
    .value();

  return targets.map(parser =>
    getDependencies(dir, filename, deps, parser, detectors)
      .then(using => ({
        using: {
          [filename]: lodash(using)
            .filter(dep => dep && dep !== '.' && dep !== '..') // TODO why need check?
            .filter(dep => !lodash.includes(builtInModules, dep))
            .uniq()
            .value(),
        },
      }), error => ({
        invalidFiles: {
          [filename]: error,
        },
      })));
}

function checkDirectory(dir, rootDir, ignoreDirs, deps, parsers, detectors) {
  return new Promise(resolve => {
    const promises = [];
    const finder = walkdir(dir, { no_recurse: true });

    finder.on('directory', subdir =>
      ignoreDirs.indexOf(path.basename(subdir)) === -1 && !isModule(subdir)
      ? promises.push(checkDirectory(subdir, rootDir, ignoreDirs, deps, parsers, detectors))
      : null);

    finder.on('file', filename =>
      promises.push(...checkFile(rootDir, filename, deps, parsers, detectors)));

    finder.on('error', (dirPath, error) =>
      promises.push(Promise.resolve({
        invalidDirs: {
          [dirPath]: error,
        },
      })));

    finder.on('end', () =>
      resolve(Promise.all(promises).then(results =>
        results.reduce((obj, current) => ({
          using: mergeBuckets(obj.using, current.using || {}),
          invalidFiles: Object.assign(obj.invalidFiles, current.invalidFiles),
          invalidDirs: Object.assign(obj.invalidDirs, current.invalidDirs),
        }), {
          using: {},
          invalidFiles: {},
          invalidDirs: {},
        }))));
  });
}

function isIgnored(ignoreMatches, dependency) {
  const match = lodash.partial(minimatch, dependency);
  return ignoreMatches.some(match);
}

function hasBin(rootDir, dependency) {
  try {
    const metadata = require(path.join(rootDir, 'node_modules', dependency, 'package.json'));
    return metadata.hasOwnProperty('bin');
  } catch (error) {
    return false;
  }
}

function filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies) {
  return lodash(dependencies)
    .keys()
    .reject(dep =>
      isIgnored(ignoreMatches, dep) ||
      ignoreBinPackage && hasBin(rootDir, dep))
    .value();
}

function buildResult(result, deps, devDeps) {
  const usingDepsLookup = lodash(result.using)
    // { f1:[d1,d2,d3], f2:[d2,d3,d4] }
    .toPairs()
    // [ [f1,[d1,d2,d3]], [f2,[d2,d3,d4]] ]
    .map(([file, dep]) => [dep, lodash.times(dep.length, () => file)])
    // [ [ [d1,d2,d3],[f1,f1,f1] ], [ [d2,d3,d4],[f2,f2,f2] ] ]
    .map(pairs => lodash.zip(...pairs))
    // [ [ [d1,f1],[d2,f1],[d3,f1] ], [ [d2,f2],[d3,f2],[d4,f2]] ]
    .flatten()
    // [ [d1,f1], [d2,f1], [d3,f1], [d2,f2], [d3,f2], [d4,f2] ]
    .groupBy(([dep]) => dep)
    // { d1:[ [d1,f1] ], d2:[ [d2,f1],[d2,f2] ], d3:[ [d3,f1],[d3,f2] ], d4:[ [d4,f2] ] }
    .mapValues(pairs => pairs.map(lodash.last))
    // { d1:[ f1 ], d2:[ f1,f2 ], d3:[ f1,f2 ], d4:[ f2 ] }
    .value();

  const usingDeps = Object.keys(usingDepsLookup);
  const missingDeps = lodash.difference(usingDeps, deps.concat(devDeps));

  const missingDepsLookup = lodash(missingDeps)
    .map(missingDep => [missingDep, usingDepsLookup[missingDep]])
    .fromPairs()
    .value();

  return {
    dependencies: lodash.difference(deps, usingDeps),
    devDependencies: lodash.difference(devDeps, usingDeps),
    missing: missingDepsLookup,
    using: usingDepsLookup,
    invalidFiles: result.invalidFiles,
    invalidDirs: result.invalidDirs,
  };
}

export default function depcheck(rootDir, options, callback) {
  const getOption = key =>
    lodash.isUndefined(options[key]) ? defaultOptions[key] : options[key];

  const withoutDev = getOption('withoutDev');
  const ignoreBinPackage = getOption('ignoreBinPackage');
  const ignoreMatches = getOption('ignoreMatches');
  const ignoreDirs = lodash.union(defaultOptions.ignoreDirs, options.ignoreDirs);

  const detectors = getOption('detectors');
  const parsers = lodash(getOption('parsers'))
    .mapValues(value => lodash.isArray(value) ? value : [value])
    .merge({ '*': getOption('specials') })
    .value();

  const metadata = options.package || require(path.join(rootDir, 'package.json'));
  const dependencies = metadata.dependencies || {};
  const devDependencies = !withoutDev && metadata.devDependencies ? metadata.devDependencies : {};
  const deps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies);
  const devDeps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, devDependencies);
  const allDeps = lodash.union(deps, devDeps);

  return checkDirectory(rootDir, rootDir, ignoreDirs, allDeps, parsers, detectors)
    .then(result => buildResult(result, deps, devDeps))
    .then(callback);
}

depcheck.parser = availableParsers;
depcheck.detector = availableDetectors;
depcheck.special = availableSpecials;

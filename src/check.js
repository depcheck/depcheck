import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import walkdir from 'walkdir';
import minimatch from 'minimatch';
import builtInModules from 'builtin-modules';
import requirePackageName from 'require-package-name';
import { readJSON } from './utils';
import getNodes from './utils/parser';

function isModule(dir) {
  try {
    readJSON(path.resolve(dir, 'package.json'));
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
    .map((detector) => {
      try {
        return detector(node);
      } catch (error) {
        return [];
      }
    })
    .flatten()
    .value();
}

function discoverPropertyDep(rootDir, deps, property, depName) {
  try {
    const file = path.resolve(rootDir, 'node_modules', depName, 'package.json');
    const metadata = readJSON(file);
    const propertyDeps = Object.keys(metadata[property] || {});
    return lodash.intersection(deps, propertyDeps);
  } catch (error) {
    return [];
  }
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
  }).then((ast) => {
    // when parser returns string array, skip detector step and treat them as dependencies.
    const dependencies = lodash.isArray(ast) && ast.every(lodash.isString)
      ? ast
      : lodash(getNodes(ast))
        .map(node => detect(detectors, node))
        .flatten()
        .uniq()
        .map(requirePackageName)
        .value();

    const discover = lodash.partial(discoverPropertyDep, dir, deps);
    const discoverPeerDeps = lodash.partial(discover, 'peerDependencies');
    const discoverOptionalDeps = lodash.partial(discover, 'optionalDependencies');
    const peerDeps = lodash(dependencies)
      .map(discoverPeerDeps)
      .flatten()
      .value();
    const optionalDeps = lodash(dependencies)
      .map(discoverOptionalDeps)
      .flatten()
      .value();

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
  return new Promise((resolve) => {
    const promises = [];
    const finder = walkdir(dir, { no_recurse: true, follow_symlinks: true });

    finder.on('directory', subdir =>
      (ignoreDirs.indexOf(path.basename(subdir)) === -1 && !isModule(subdir)
        ? promises.push(checkDirectory(subdir, rootDir, ignoreDirs, deps, parsers, detectors))
        : null));

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

function buildResult(result, deps, devDeps, peerDeps, optionalDeps, skipMissing) {
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
  const allDeps = deps.concat(devDeps).concat(peerDeps).concat(optionalDeps);
  const missingDeps = lodash.difference(usingDeps, allDeps);

  const missingDepsLookup = skipMissing
    ? []
    : lodash(missingDeps)
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

export default function check({
  rootDir,
  ignoreDirs,
  skipMissing,
  deps,
  devDeps,
  peerDeps,
  optionalDeps,
  parsers,
  detectors,
}) {
  const allDeps = lodash.union(deps, devDeps);
  return checkDirectory(rootDir, rootDir, ignoreDirs, allDeps, parsers, detectors)
    .then(result => buildResult(result, deps, devDeps, peerDeps, optionalDeps, skipMissing));
}

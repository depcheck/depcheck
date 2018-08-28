import path from 'path';
import lodash from 'lodash';
import minimatch from 'minimatch';
import check from './check';
import { readJSON } from './utils';

import {
  defaultOptions,
  availableParsers,
  availableDetectors,
  availableSpecials,
} from './constants';

function isIgnored(ignoreMatches, dependency) {
  const match = lodash.partial(minimatch, dependency);
  return ignoreMatches.some(match);
}

function hasBin(rootDir, dependency) {
  try {
    const metadata = readJSON(path.join(rootDir, 'node_modules', dependency, 'package.json'));
    return {}.hasOwnProperty.call(metadata, 'bin');
  } catch (error) {
    return false;
  }
}

function filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies) {
  return lodash(dependencies)
    .keys()
    .reject(dep =>
      (isIgnored(ignoreMatches, dep))
      || (ignoreBinPackage && hasBin(rootDir, dep)))
    .value();
}

export default function depcheck(rootDir, options, callback) {
  const getOption = key =>
    (lodash.isUndefined(options[key]) ? defaultOptions[key] : options[key]);

  const withoutDev = getOption('withoutDev');
  const ignoreBinPackage = getOption('ignoreBinPackage');
  const ignoreMatches = getOption('ignoreMatches');
  const ignoreDirs = lodash.union(defaultOptions.ignoreDirs, options.ignoreDirs);
  const skipMissing = getOption('skipMissing');

  const detectors = getOption('detectors');
  const parsers = lodash(getOption('parsers'))
    .mapValues(value => (lodash.isArray(value) ? value : [value]))
    .merge({ '*': getOption('specials') })
    .value();

  const metadata = options.package || readJSON(path.join(rootDir, 'package.json'));
  const dependencies = metadata.dependencies || {};
  const devDependencies = !withoutDev && metadata.devDependencies ? metadata.devDependencies : {};
  const peerDeps = Object.keys(metadata.peerDependencies || {});
  const optionalDeps = Object.keys(metadata.optionalDependencies || {});
  const deps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, dependencies);
  const devDeps = filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, devDependencies);

  return check({
    rootDir,
    ignoreDirs,
    skipMissing,
    deps,
    devDeps,
    peerDeps,
    optionalDeps,
    parsers,
    detectors,
  })
    .then(results => Object.assign(results, {
      missing: lodash.pick(
        results.missing,
        filterDependencies(rootDir, ignoreBinPackage, ignoreMatches, results.missing),
      ),
    }))
    .then(callback);
}

depcheck.parser = availableParsers;
depcheck.detector = availableDetectors;
depcheck.special = availableSpecials;

import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import minimatch from 'minimatch';
import ignore from 'ignore';
import debug from 'debug';
import check from './check';
import { loadModuleData, readJSON, tryRequire } from './utils';

import {
  defaultOptions,
  availableParsers,
  availableDetectors,
  availableSpecials,
} from './constants';

function registerTs(rootDir) {
  if (!require.extensions['.ts']) {
    const ts = tryRequire('typescript', [rootDir, process.cwd(), __dirname]);
    if (ts) {
      require.extensions['.ts'] = (module, filename) => {
        const content = fs.readFileSync(filename, 'utf8');
        const options = tryRequire(path.join(rootDir, 'package.json')) || {};
        options.fileName = filename;
        const transpiled = ts.transpileModule(
          content.charCodeAt(0) === 0xfeff ? content.slice(1) : content,
          options,
        );
        // eslint-disable-next-line no-underscore-dangle
        module._compile(transpiled.outputText, filename);
      };
    }
  }
}

function isIgnored(ignoreMatches, dependency) {
  const match = lodash.partial(minimatch, dependency);
  return ignoreMatches.some(match);
}

function hasBin(rootDir, dependency) {
  const { metadata } = loadModuleData(dependency, rootDir);
  return !!metadata && {}.hasOwnProperty.call(metadata, 'bin');
}

function filterDependencies(
  rootDir,
  ignoreBinPackage,
  ignoreMatches,
  dependencies,
) {
  return lodash(dependencies)
    .keys()
    .reject(
      (dep) =>
        isIgnored(ignoreMatches, dep) ||
        (ignoreBinPackage && hasBin(rootDir, dep)),
    )
    .value();
}

function getIgnorer({ rootDir, ignorePath, ignorePatterns }) {
  const ignorer = ignore();

  ignorer.add(ignorePatterns);

  // If an .*ignore file is configured
  if (ignorePath) {
    const ignorePathFile = path.resolve(rootDir, ignorePath);
    if (fs.existsSync(ignorePathFile)) {
      debug('depcheck:ignorer')(`Using ${ignorePathFile} as ignore file.`);
      const ignorePathFileContent = fs.readFileSync(ignorePathFile, 'utf8');
      ignorer.add(ignorePathFileContent);
    }
    return ignorer;
  }

  // Fallback on .depcheckignore or .gitignore
  const ignoreFile = ['.depcheckignore', '.gitignore']
    .map((file) => path.resolve(rootDir, file))
    .find((file) => fs.existsSync(file));

  if (ignoreFile) {
    debug('depcheck:ignorer')(`Using ${ignoreFile} as ignore file.`);
    const ignoreContent = fs.readFileSync(ignoreFile, 'utf8');
    ignorer.add(ignoreContent);
  }

  return ignorer;
}

export default function depcheck(rootDir, options, callback) {
  registerTs(rootDir);

  const getOption = (key) =>
    lodash.isUndefined(options[key]) ? defaultOptions[key] : options[key];

  const ignoreBinPackage = getOption('ignoreBinPackage');
  const ignoreMatches = getOption('ignoreMatches');
  const ignorePath = getOption('ignorePath');
  const skipMissing = getOption('skipMissing');

  // Support for ignoreDirs and ignorePatterns
  // - potential BREAKING CHANGE with previous implementation
  // - ignoreDirs was previously matching the exact name of a given directory
  // - ignorePatterns now use glob style syntax provided by the `ignore` package
  // - given the previous usage, should be mostly retro-compatible
  const ignorePatterns = lodash.union(
    defaultOptions.ignorePatterns,
    options.ignoreDirs,
    options.ignorePatterns,
  );

  const detectors = getOption('detectors');
  const parsers = lodash(getOption('parsers'))
    .mapValues((value) => (lodash.isArray(value) ? value : [value]))
    .merge({ '*': getOption('specials') })
    .value();

  const metadata =
    options.package || readJSON(path.join(rootDir, 'package.json'));
  const dependencies = metadata.dependencies || {};
  const devDependencies = metadata.devDependencies
    ? metadata.devDependencies
    : {};
  const peerDeps = Object.keys(metadata.peerDependencies || {});
  const optionalDeps = Object.keys(metadata.optionalDependencies || {});
  const deps = filterDependencies(
    rootDir,
    ignoreBinPackage,
    ignoreMatches,
    dependencies,
  );
  const devDeps = filterDependencies(
    rootDir,
    ignoreBinPackage,
    ignoreMatches,
    devDependencies,
  );

  const ignorer = getIgnorer({ rootDir, ignorePath, ignorePatterns });

  return check({
    rootDir,
    ignorer,
    skipMissing,
    deps,
    devDeps,
    peerDeps,
    optionalDeps,
    parsers,
    detectors,
  })
    .then((results) =>
      Object.assign(results, {
        missing: lodash.pick(
          results.missing,
          filterDependencies(
            rootDir,
            ignoreBinPackage,
            ignoreMatches,
            results.missing,
          ),
        ),
      }),
    )
    .then(callback);
}

depcheck.parser = availableParsers;
depcheck.detector = availableDetectors;
depcheck.special = availableSpecials;

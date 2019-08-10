import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import lodash from 'lodash';

import depcheck from './index';
import readLinesSeparatedFile from './utils/read-lines-separated-file';
import { version } from '../package.json';

function checkPathExist(dir, errorMessage) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, (result) => (result ? resolve() : reject(errorMessage))),
  );
}

function getParsers(parsers) {
  return lodash.isUndefined(parsers)
    ? undefined
    : lodash(parsers)
        .split(',')
        .map((keyValuePair) => keyValuePair.split(':'))
        .fromPairs()
        .mapValues((value) =>
          value.split('&').map((name) => depcheck.parser[name]),
        )
        .value();
}

function getDetectors(detectors) {
  return lodash.isUndefined(detectors)
    ? undefined
    : detectors.split(',').map((name) => depcheck.detector[name]);
}

function getSpecials(specials) {
  return lodash.isUndefined(specials)
    ? undefined
    : specials.split(',').map((name) => depcheck.special[name]);
}

function noIssue(result) {
  return (
    lodash.isEmpty(result.dependencies) &&
    lodash.isEmpty(result.devDependencies) &&
    lodash.isEmpty(result.missing)
  );
}

function prettify(caption, deps) {
  const list = deps.map((dep) => `* ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

function mapMissing(missing, rootDir) {
  return lodash.map(
    missing,
    (foundInFiles, key) =>
      `${key}: ${lodash.replace(lodash.first(foundInFiles), rootDir, '.')}`,
  );
}

function print(result, log, json, rootDir) {
  if (json) {
    log(
      JSON.stringify(result, (key, value) =>
        lodash.isError(value) ? value.stack : value,
      ),
    );
  } else if (noIssue(result)) {
    log('No depcheck issue');
  } else {
    const deps = prettify('Unused dependencies', result.dependencies);
    const devDeps = prettify('Unused devDependencies', result.devDependencies);
    const missing = prettify(
      'Missing dependencies',
      mapMissing(result.missing, rootDir),
    );
    const content = deps.concat(devDeps, missing).join('\n');
    log(content);
  }

  return result;
}

function checkDeprecation(argv) {
  if (argv.dev === false) {
    deprecate(
      'depcheck',
      'The option `dev` is deprecated. It leads a wrong result for missing dependencies'
      + ' when it is `false`. This option will be removed and enforced to `true` in next'
      + ' major version.',
    );
  }
}

function getIgnores(ignoresString, ignoresFilePath) {
  const ignoresFromPathPromise = ignoresFilePath
    ? readLinesSeparatedFile(ignoresFilePath).catch(err =>
      Promise.reject(new Error(`An issue has happened reading the ignores file: ${err.stack}`)))
    : Promise.resolve([]);
  const ignores = ignoresString.split(',');
  return Promise.all([ignoresFromPathPromise, Promise.resolve(ignores)])
    .then(([resolvedIgnoresFromPath, resolvedIgnores]) => {
      const uniqueResolves = new Set(resolvedIgnores.concat(resolvedIgnoresFromPath));
      return [...uniqueResolves];
    });
}

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean(['ignore-bin-package', 'skip-missing'])
    .default({
      'ignore-bin-package': false,
      'skip-missing': false,
    })
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('skip-missing', 'Skip calculation of missing dependencies')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignores-file', 'Path of a lines separated package list file to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('parsers', 'Comma separated glob:parser pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message');

  const dir = opt.argv._[0] || '.';
  const rootDir = path.resolve(dir);

  checkPathExist(rootDir, `Path ${dir} does not exist`)
    .then(() => checkPathExist(
      path.resolve(rootDir, 'package.json'),
      `Path ${dir} does not contain a package.json file`,
    ))
    .then(() => getIgnores((opt.argv.ignores || ''), opt.argv.ignoresFile))
    .then(ignores => depcheck(rootDir, {
      ignoreBinPackage: opt.argv.ignoreBinPackage,
      ignoreMatches: ignores,
      ignoreDirs: (opt.argv.ignoreDirs || '').split(','),
      parsers: getParsers(opt.argv.parsers),
      detectors: getDetectors(opt.argv.detectors),
      specials: getSpecials(opt.argv.specials),
      skipMissing: opt.argv.skipMissing,
    }))
    .then(result => print(result, log, opt.argv.json, rootDir))
    .then((result) => exit(noIssue(result) ? 0 : -1))
    .catch((errorMessage) => {
      error(errorMessage);
      exit(-1);
    });
}

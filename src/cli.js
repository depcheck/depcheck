import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import lodash from 'lodash';
import deprecate from 'deprecate';

import depcheck from './index';
import { version } from '../package.json';

function checkPathExist(dir, errorMessage) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, result =>
      (result ? resolve() : reject(errorMessage))));
}

function getParsers(parsers) {
  return lodash.isUndefined(parsers)
    ? undefined
    : lodash(parsers)
      .split(',')
      .map(keyValuePair => keyValuePair.split(':'))
      .fromPairs()
      .mapValues(value => value.split('&').map(name => depcheck.parser[name]))
      .value();
}

function getDetectors(detectors) {
  return lodash.isUndefined(detectors)
    ? undefined
    : detectors.split(',').map(name => depcheck.detector[name]);
}

function getSpecials(specials) {
  return lodash.isUndefined(specials)
    ? undefined
    : specials.split(',').map(name => depcheck.special[name]);
}

function noIssue(result) {
  return lodash.isEmpty(result.dependencies)
      && lodash.isEmpty(result.devDependencies)
      && lodash.isEmpty(result.missing);
}

function prettify(caption, deps) {
  const list = deps.map(dep => `* ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

function print(result, log, json) {
  if (json) {
    log(JSON.stringify(result, (key, value) => (lodash.isError(value) ? value.stack : value)));
  } else if (noIssue(result)) {
    log('No depcheck issue');
  } else {
    const deps = prettify('Unused dependencies', result.dependencies);
    const devDeps = prettify('Unused devDependencies', result.devDependencies);
    const missing = prettify('Missing dependencies', Object.keys(result.missing));
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

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean([
      'dev',
      'ignore-bin-package',
      'skip-missing',
    ])
    .default({
      dev: true,
      'ignore-bin-package': false,
      'skip-missing': false,
    })
    .describe('dev', '[DEPRECATED] Check on devDependecies')
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('skip-missing', 'Skip calculation of missing dependencies')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('parsers', 'Comma separated glob:parser pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message');

  checkDeprecation(opt.argv);

  const dir = opt.argv._[0] || '.';
  const rootDir = path.resolve(dir);

  checkPathExist(rootDir, `Path ${dir} does not exist`)
    .then(() => checkPathExist(
      path.resolve(rootDir, 'package.json'),
      `Path ${dir} does not contain a package.json file`,
    ))
    .then(() => depcheck(rootDir, {
      withoutDev: !opt.argv.dev,
      ignoreBinPackage: opt.argv.ignoreBinPackage,
      ignoreMatches: (opt.argv.ignores || '').split(','),
      ignoreDirs: (opt.argv.ignoreDirs || '').split(','),
      parsers: getParsers(opt.argv.parsers),
      detectors: getDetectors(opt.argv.detectors),
      specials: getSpecials(opt.argv.specials),
      skipMissing: opt.argv.skipMissing,
    }))
    .then(result => print(result, log, opt.argv.json))
    .then(result => exit((opt.argv.json || noIssue(result)) ? 0 : -1))
    .catch((errorMessage) => {
      error(errorMessage);
      exit(-1);
    });
}

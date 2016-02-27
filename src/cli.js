import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import lodash from 'lodash';
import depcheck from './index';
import output from './utils/output';
import { version } from '../package.json';

function checkPathExist(dir) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, result => result ? resolve() : reject()));
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

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean([
      'dev',
      'ignore-bin-package',
    ])
    .default({
      dev: true,
      'ignore-bin-package': false,
    })
    .describe('dev', 'Check on devDependecies')
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('parsers', 'Comma separated glob:pasers pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message');

  const dir = opt.argv._[0] || '.';
  const rootDir = path.resolve(dir);

  checkPathExist(rootDir)
  .catch(() => {
    error(`Path ${dir} does not exist`);
    exit(-1);
  })
  .then(() => checkPathExist(path.resolve(rootDir, 'package.json')))
  .catch(() => {
    error(`Path ${dir} does not contain a package.json file`);
    log(opt.getUsageInstance().help());
    exit(-1);
  })
  .then(() => depcheck(rootDir, {
    withoutDev: !opt.argv.dev,
    ignoreBinPackage: opt.argv.ignoreBinPackage,
    ignoreMatches: (opt.argv.ignores || '').split(','),
    ignoreDirs: (opt.argv.ignoreDirs || '').split(','),
    parsers: getParsers(opt.argv.parsers),
    detectors: getDetectors(opt.argv.detectors),
    specials: getSpecials(opt.argv.specials),
  }))
  .then(result => output(result, log, opt.argv.json))
  .then(({ dependencies: deps, devDependencies: devDeps }) =>
    exit(opt.argv.json || deps.length === 0 && devDeps.length === 0 ? 0 : -1));
}

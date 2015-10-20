import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import depcheck from './index';
import output from './utils/output';
import webReport from './utils/web-report';

function checkPathExist(dir) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, result => result ? resolve() : reject()));
}

function getParsers(parsers) {
  return typeof parsers === 'undefined'
    ? undefined
    : Object.assign({}, ...parsers.split(',').map(keyValuePair => {
      const [glob, value] = keyValuePair.split(':');
      return { [glob]: value.split('&').map(name => depcheck.parser[name]) };
    }));
}

function getDetectors(detectors) {
  return typeof detectors === 'undefined'
    ? undefined
    : detectors.split(',').map(name => depcheck.detector[name]);
}

function getSpecials(specials) {
  return typeof specials === 'undefined'
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
    .string([
      'web-report',
      'web-service',
    ])
    .default({
      'dev': true,
      'ignore-bin-package': true,
      'web-service': 'https://depcheck.tk',
    })
    .describe('dev', 'Check on devDependecies')
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('web-report', 'Generate web report with depcheck web service')
    .describe('web-service', 'Specify depcheck web service URL')
    .describe('parsers', 'Comma separated glob:pasers pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .describe('help', 'Show this help message');

  if (opt.argv.help) {
    log(opt.help());
    exit(0);
  } else {
    const dir = opt.argv._[0] || '.';
    const rootDir = path.resolve(dir);

    checkPathExist(rootDir)
    .catch(() => {
      error('Path ' + dir + ' does not exist');
      exit(-1);
    })
    .then(() => checkPathExist(path.resolve(rootDir, 'package.json')))
    .catch(() => {
      error('Path ' + dir + ' does not contain a package.json file');
      log(opt.help());
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
    .then(result => webReport(result, log, error, process.env, opt.argv)) // TODO extract env
    .then(({ dependencies, devDependencies }) =>
      exit(opt.argv.json
        || dependencies.length === 0 && devDependencies.length === 0
        ? 0
        : -1));
  }
}

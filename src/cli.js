import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import lodash from 'lodash';

import depcheck from './index';
import { readJSON } from './utils';

import { version } from '../package.json';

function checkPathExist(dir, errorMessage) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, (result) => (result ? resolve() : reject(errorMessage))),
  );
}

function getParsers(parsers) {
  if (lodash.isUndefined(parsers)) {
    return undefined;
  }
  return lodash.isObject(parsers)
    ? lodash(parsers)
        .mapValues((name) => depcheck.parser[name])
        .value()
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
  if (lodash.isUndefined(detectors)) {
    return undefined;
  }
  return lodash.isArray(detectors)
    ? detectors.map((name) => depcheck.detector[name])
    : detectors.split(',').map((name) => depcheck.detector[name]);
}

function getSpecials(specials) {
  if (lodash.isUndefined(specials)) {
    return undefined;
  }
  return lodash.isArray(specials)
    ? specials.map((name) => depcheck.special[name])
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

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean(['dev', 'ignore-bin-package', 'skip-missing'])
    .default({ dev: true })
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

  const dir = opt.argv._[0] || '.';
  const rootDir = path.resolve(dir);

  checkPathExist(rootDir, `Path ${dir} does not exist`)
    .then(() =>
      checkPathExist(
        path.resolve(rootDir, 'package.json'),
        `Path ${dir} does not contain a package.json file`,
      ),
    )
    .then(() => readJSON(path.join(rootDir, 'package.json')))
    .then((packageJson) =>
      depcheck(rootDir, {
        ignoreBinPackage:
          typeof opt.argv.ignoreBinPackage !== 'undefined'
            ? opt.argv.ignoreBinPackage
            : lodash.get(packageJson, 'depcheck.ignoreBinPackage'),
        ignoreMatches:
          typeof opt.argv.ignores !== 'undefined'
            ? opt.argv.ignores.split(',')
            : lodash.get(packageJson, 'depcheck.ignoreMatches'),
        ignoreDirs:
          typeof opt.argv.ignoreDirs !== 'undefined'
            ? opt.argv.ignoreDirs.split(',')
            : lodash.get(packageJson, 'depcheck.ignoreDirs'),
        parsers: getParsers(
          opt.argv.parsers || lodash.get(packageJson, 'depcheck.parsers'),
        ),
        detectors: getDetectors(
          opt.argv.detectors || lodash.get(packageJson, 'depcheck.detectors'),
        ),
        specials: getSpecials(
          opt.argv.specials || lodash.get(packageJson, 'depcheck.specials'),
        ),
        skipMissing:
          typeof opt.argv.skipMissing !== 'undefined'
            ? opt.argv.skipMissing
            : lodash.get(packageJson, 'depcheck.skipMissing'),
      }),
    )
    .then((result) => print(result, log, opt.argv.json, rootDir))
    .then((result) => exit(noIssue(result) ? 0 : -1))
    .catch((errorMessage) => {
      error(errorMessage);
      exit(-1);
    });
}

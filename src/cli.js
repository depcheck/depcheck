import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import lodash from 'lodash';

import depcheck from './index';
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

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean(['dev', 'ignore-bin-package', 'skip-missing'])
    .default({
      dev: true,
      'ignore-bin-package': false,
      'skip-missing': false,
    })
    .describe('config', 'Pass a config file')
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
  const config =
    opt.argv.config !== undefined
      ? require(path.resolve(opt.argv.config)) // eslint-disable-line global-require
      : {};

  checkPathExist(rootDir, `Path ${dir} does not exist`)
    .then(() =>
      config.package !== undefined
        ? Promise.resolve()
        : checkPathExist(
            path.resolve(rootDir, 'package.json'),
            `Path ${dir} does not contain a package.json file`,
          ),
    )
    .then(() =>
      depcheck(rootDir, {
        ...config,
        ...(opt.argv.ignoreBinPackage
          ? { ignoreBinPackage: opt.argv.ignoreBinPackage }
          : {}),
        ...(opt.argv.ignores !== undefined
          ? { ignoreMatches: (opt.argv.ignores || '').split(',') }
          : {}),
        ...(opt.argv.ignoreDirs !== undefined
          ? { ignoreDirs: (opt.argv.ignoreDirs || '').split(',') }
          : {}),
        ...(opt.argv.parsers !== undefined
          ? { parsers: getParsers(opt.argv.parsers) }
          : {}),
        ...(opt.argv.detectors !== undefined
          ? { detectors: getDetectors(opt.argv.detectors) }
          : {}),
        ...(opt.argv.specials !== undefined
          ? { specials: getSpecials(opt.argv.specials) }
          : {}),
        ...(opt.argv.skipMissing !== undefined
          ? { skipMissing: opt.argv.skipMissing }
          : {}),
      }),
    )
    .then((result) => print(result, log, opt.argv.json, rootDir))
    .then((result) => exit(noIssue(result) ? 0 : -1))
    .catch((errorMessage) => {
      error(errorMessage);
      exit(-1);
    });
}

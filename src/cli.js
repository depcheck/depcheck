import fs from 'fs';
import path from 'path';
import lodash from 'lodash';

import depcheck from './index';
import { version, name } from '../package.json';
import { getConfiguration } from './utils/configuration-reader';

function checkPathExist(dir, errorMessage) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, (result) => (result ? resolve() : reject(errorMessage))),
  );
}

function getParsers(parsers) {
  return lodash.isUndefined(parsers)
    ? undefined
    : lodash(parsers)
        .map((keyValuePair) => keyValuePair.split(':'))
        .fromPairs()
        .mapValues((value) =>
          value.split('&').map((parserName) => depcheck.parser[parserName]),
        )
        .value();
}

function getDetectors(detectors) {
  return lodash.isUndefined(detectors)
    ? undefined
    : detectors.map((detectorName) => depcheck.detector[detectorName]);
}

function getSpecials(specials) {
  return lodash.isUndefined(specials)
    ? undefined
    : specials.map((specialName) => depcheck.special[specialName]);
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

export default async function cli(args, log, error, exit) {
  try {
    const opt = await getConfiguration(args, name, version);
    const dir = opt._[0] || '.';
    const rootDir = path.resolve(dir);
    await checkPathExist(rootDir, `Path ${dir} does not exist`);
    await checkPathExist(
      path.resolve(rootDir, 'package.json'),
      `Path ${dir} does not contain a package.json file`,
    );
    const depcheckResult = await depcheck(rootDir, {
      withoutDev: !opt.dev,
      ignoreBinPackage: opt.ignoreBinPackage,
      ignoreMatches: opt.ignores || [],
      ignoreDirs: opt.ignoreDirs || [],
      parsers: getParsers(opt.parsers),
      detectors: getDetectors(opt.detectors),
      specials: getSpecials(opt.specials),
      skipMissing: opt.skipMissing,
    });
    print(depcheckResult, log, opt.json);
    exit(opt.json || noIssue(depcheckResult) ? 0 : -1);
  } catch (err) {
    error(err);
    exit(-1);
  }
}

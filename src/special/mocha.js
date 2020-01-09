import fs from 'fs';
import path from 'path';
import requirePackageName from 'require-package-name';
import { parse } from '../utils/cli-tools';
import { getScripts, wrapToArray } from '../utils';

const knownReporters = [
  'dot',
  'doc',
  'tap',
  'json',
  'html',
  'list',
  'min',
  'spec',
  'nyan',
  'xunit',
  'markdown',
  'progress',
  'landing',
  'json-stream',
];
const mochaTypescript = '@types/mocha';

function getOptsConfig(root, config, param) {
  const argvs = config.split(/\s+/);
  const optsIndex = argvs.indexOf(param);

  if (optsIndex === -1) {
    return null;
  }

  const optsPath = argvs[optsIndex + 1];

  if (!optsPath) {
    return null;
  }

  return fs.readFileSync(path.resolve(root, '..', optsPath), 'utf-8');
}

function getCliDependencies(content, deps) {
  const lines = content.split(/\s+/);
  const result = [];

  lines.forEach((line, idx) => {
    if (line === '--require') {
      const val = lines[idx + 1];
      if (val && !val.startsWith('--')) {
        result.push(val);
      }
    }
    if (line === '--reporter') {
      const val = lines[idx + 1];
      if (val && !val.startsWith('--') && !knownReporters.includes(val)) {
        result.push(val);
      }
    }
  });

  return result
    .map(requirePackageName)
    .filter((v, k, arr) => arr.indexOf(v) === k)
    .filter((name) => deps.includes(name));
}

function getParamDependencies(content, deps) {
  const result = [];
  if (content.require) {
    result.push(...wrapToArray(content.require));
  }
  if (content.reporter) {
    result.push(
      ...wrapToArray(content.reporter).filter(
        (r) => !knownReporters.includes(r),
      ),
    );
  }
  return result
    .map(requirePackageName)
    .filter((v, k, arr) => arr.indexOf(v) === k)
    .filter((name) => deps.includes(name));
}

const configNameRegex = /^\.mocharc\.(json|jsonc|js|yml|yaml)$/;

export default function parseMocha(content, filepath, deps, rootDir) {
  const defaultOptPath = path.resolve(rootDir, 'test/mocha.opts');
  const basename = path.basename(filepath);
  let cliConfig;
  let paramConfig;

  if (filepath === defaultOptPath) {
    cliConfig = content;
  } else if (configNameRegex.test(basename)) {
    paramConfig = parse(content);
  } else {
    const scripts = getScripts(filepath, content);
    const mochaScript = scripts.find((s) => s.indexOf('mocha') !== -1);
    if (mochaScript) {
      cliConfig = mochaScript.slice(mochaScript.indexOf('mocha'));
    }
    if (basename === 'package.json') {
      paramConfig = JSON.parse(content).mocha;
    }
  }

  const requires = [];

  if (cliConfig) {
    let optsConfig;

    optsConfig = getOptsConfig(filepath, cliConfig, '--opts');
    if (optsConfig) {
      requires.push(...getCliDependencies(optsConfig, deps));
    }

    optsConfig = getOptsConfig(filepath, cliConfig, '--config');
    if (optsConfig) {
      requires.push(...getParamDependencies(parse(optsConfig), deps));
    }

    requires.push(...getCliDependencies(cliConfig, deps));
  }

  if (paramConfig) {
    requires.push(...getParamDependencies(paramConfig, deps));
  }

  if ((cliConfig || paramConfig) && deps.includes(mochaTypescript)) {
    requires.push(mochaTypescript);
  }

  return requires;
}

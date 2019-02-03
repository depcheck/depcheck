import fs from 'fs';
import path from 'path';
import requirePackageName from 'require-package-name';
import { getScripts } from '../utils';

const knownReporters = [
  'dot', 'doc', 'tap', 'json', 'html', 'list',
  'min', 'spec', 'nyan', 'xunit', 'markdown', 'progress',
  'landing', 'json-stream',
];

function getOptsConfig(root, config) {
  const argvs = config.split(/\s+/);
  const optsIndex = argvs.indexOf('--opts');

  if (optsIndex === -1) {
    return null;
  }

  const optsPath = argvs[optsIndex + 1];

  if (!optsPath) {
    return null;
  }

  return fs.readFileSync(path.resolve(root, '..', optsPath), 'utf-8');
}

function getDependencies(content, deps) {
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
    .filter(name => deps.includes(name));
}

export default function parseMocha(content, filepath, deps, rootDir) {
  const defaultOptPath = path.resolve(rootDir, 'test/mocha.opts');
  let config;

  if (filepath === defaultOptPath) {
    config = content;
  } else {
    const scripts = getScripts(filepath, content);
    const mochaScript = scripts.find(s => s.indexOf('mocha') !== -1);
    if (mochaScript) {
      config = mochaScript.slice(mochaScript.indexOf('mocha'));
    }
  }

  if (!config) {
    return [];
  }

  const requires = [];
  const optsConfig = getOptsConfig(filepath, config);

  if (optsConfig) {
    requires.push(...getDependencies(optsConfig, deps));
  }

  requires.push(...getDependencies(config, deps));

  return requires;
}

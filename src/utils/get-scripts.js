import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';

const scriptCache = {};

export function clearCache() {
  Object.keys(scriptCache).forEach((key) => {
    scriptCache[key] = undefined;
  });
}

function getCacheOrFile(key, fn) {
  if (scriptCache[key]) {
    return scriptCache[key];
  }

  const value = fn();
  scriptCache[key] = value;

  return value;
}

const travisCommands = [
  // Reference: https://docs.travis-ci.com/user/job-lifecycle
  'before_install',
  'install',
  'before_script',
  'script',
  'before_cache',
  'after_success',
  'after_failure',
  'before_deploy',
  // 'deploy', // currently ignored
  'after_deploy',
  'after_script',
];

export default function getScripts(filepath, content) {
  return getCacheOrFile(filepath, () => {
    const basename = path.basename(filepath);

    if (basename === 'package.json') {
      return lodash.values(JSON.parse(content).scripts || {});
    }

    if (basename === '.travis.yml') {
      const metadata = yaml.safeLoad(content) || {};
      return lodash(travisCommands)
        .map((cmd) => metadata[cmd] || [])
        .flatten()
        .value();
    }

    return [];
  });
}

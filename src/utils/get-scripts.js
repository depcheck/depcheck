import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';
import { getContent } from './file';

const scriptCache = {};

export function clearCache() {
  Object.keys(scriptCache).forEach((key) => {
    scriptCache[key] = undefined;
  });
}

async function getCacheOrFile(key, fn) {
  if (scriptCache[key]) {
    return scriptCache[key];
  }

  const value = await fn();
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

export default async function getScripts(filename) {
  return getCacheOrFile(filename, async () => {
    const basename = path.basename(filename);

    if (basename === 'package.json') {
      const content = await getContent(filename);
      return lodash.values(JSON.parse(content).scripts || {});
    }

    if (basename === '.travis.yml') {
      const content = await getContent(filename);
      const metadata = yaml.safeLoad(content) || {};
      return lodash(travisCommands)
        .map((cmd) => metadata[cmd] || [])
        .flatten()
        .value();
    }

    return [];
  });
}

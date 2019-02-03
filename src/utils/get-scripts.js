import fs from 'fs';
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
  // Reference: http://docs.travis-ci.com/user/customizing-the-build/#The-Build-Lifecycle
  'before_install',
  'install',
  'before_script',
  'script',
  'after_success or after_failure',
  'before_deploy',
  'after_deploy',
  'after_script',
];

export default function getScripts(filepath, content = null) {
  return getCacheOrFile(filepath, () => {
    const basename = path.basename(filepath);
    const fileContent = content !== null ? content : fs.readFileSync(filepath, 'utf-8');

    if (basename === 'package.json') {
      return lodash.values(JSON.parse(fileContent).scripts || {});
    }
    if (basename === '.travis.yml') {
      const metadata = yaml.safeLoad(content) || {};
      return lodash(travisCommands)
        .map(cmd => metadata[cmd] || [])
        .flatten()
        .value();
    }

    return [];
  });
}

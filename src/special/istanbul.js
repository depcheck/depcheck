import path from 'path';
import { parse } from '../utils/cli-tools';
import { getContent } from '../utils/file';

const configNameRegex = /^(\.nycrc(\.(json|yml|yaml))?|nyc.config.js)$/;

function getExtendsDependencies(extendConfig, deps) {
  const dependencies = [];
  if (Array.isArray(extendConfig)) {
    extendConfig.forEach((extend) =>
      dependencies.push(...getExtendsDependencies(extend, deps)),
    );
  } else if (!path.isAbsolute(extendConfig)) {
    const extendParts = extendConfig.split('/');
    let depName = extendParts.shift();
    if (depName.startsWith('@')) {
      depName += `/${extendParts.shift()}`;
    }
    if (deps.includes(depName)) {
      dependencies.push(depName);
    }
  }
  return dependencies;
}

export default async function parseIstanbul(filename, deps) {
  const basename = path.basename(filename);
  let config;

  if (configNameRegex.test(basename)) {
    const content = await getContent(filename);
    config = parse(content);
  } else if (basename === 'package.json') {
    const content = await getContent(filename);
    config = JSON.parse(content).nyc;
  }

  const requires = [];
  if (config && config.extends) {
    requires.push(...getExtendsDependencies(config.extends, deps));
  }
  return requires;
}

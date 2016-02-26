import path from 'path';
import lodash from 'lodash';
import getScripts from '../utils/get-scripts';

const metadataCache = {};

function getCacheOrRequire(packagePath) {
  if (metadataCache[packagePath]) {
    return metadataCache[packagePath];
  }

  const metadata = require(packagePath);
  metadataCache[packagePath] = metadata;
  return metadata;
}

function loadMetadata(dep, dir) {
  try {
    const packagePath = path.resolve(dir, 'node_modules', dep, 'package.json');
    return getCacheOrRequire(packagePath);
  } catch (error) {
    return {}; // ignore silently
  }
}

function getBinaryFeatures(dep, [key, value]) {
  const binPath = path.join('node_modules', dep, value).replace(/\\/g, '/');

  const features = [
    key,
    `$(npm bin)/${key}`,
    `node_modules/.bin/${key}`,
    `./node_modules/.bin/${key}`,
    binPath,
    `./${binPath}`,
  ];

  return features;
}

function isBinaryInUse(dep, scripts, dir) {
  const metadata = loadMetadata(dep, dir);
  const binaries = lodash.toPairs(metadata.bin || {});
  return binaries.some(bin =>
    getBinaryFeatures(dep, bin).some(feature =>
      scripts.some(script =>
        lodash.includes(` ${script} `, ` ${feature} `))));
}

export default (content, filepath, deps, dir) => {
  const scripts = getScripts(filepath, content);
  return deps.filter(dep => isBinaryInUse(dep, scripts, dir));
};

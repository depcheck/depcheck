import path from 'path';
import getScripts from '../utils/get-scripts';

const metadataCache = {};

function toKeyValuePair(object) {
  return Object.keys(object).map(key => ({ key, value: object[key] }));
}

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

function toMetadata(dep, dir) {
  const metadata = loadMetadata(dep, dir);
  const binaryLookup = metadata.bin || {};
  const binaries = toKeyValuePair(binaryLookup);

  return { dep, binaries };
}

function getBinFeatures(dep, bin) {
  const binPath = path.join('node_modules', dep, bin.value).replace(/\\/g, '/');

  const features = [
    bin.key,
    `$(npm bin)/${bin.key}`,
    `node_modules/.bin/${bin.key}`,
    `./node_modules/.bin/${bin.key}`,
    binPath,
    `./${binPath}`,
  ];

  return features;
}

function isUsedBin(dep, bin, scripts) {
  const features = getBinFeatures(dep, bin);
  return scripts.some(script =>
    features.some(char => ` ${script} `.indexOf(` ${char} `) !== -1));
}

function getUsedDeps(deps, scripts, dir) {
  return deps
  .map(dep => toMetadata(dep, dir))
  .filter(metadata =>
    metadata.binaries.some(bin => isUsedBin(metadata.dep, bin, scripts)))
  .map(metadata => metadata.dep);
}

export default (content, filepath, deps, dir) => {
  const scripts = getScripts(filepath, content);
  return getUsedDeps(deps, scripts, dir);
};

import path from 'path';
import yaml from 'js-yaml';

function getObjectValues(object) {
  return Object.keys(object).map(key => object[key]);
}

function toKeyValuePair(object) {
  return Object.keys(object).map(key => ({ key, value: object[key] }));
}

function toMetadata(dep, dir) {
  const packagePath = path.resolve(dir, 'node_modules', dep, 'package.json');
  const metadata = require(packagePath);
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

export default (content, filename, deps, dir) => {
  const basename = path.basename(filename);
  if (basename === 'package.json') {
    const scripts = getObjectValues(JSON.parse(content).scripts || {});
    return getUsedDeps(deps, scripts, dir);
  } else if (basename === '.travis.yml') {
    const metadata = yaml.safeLoad(content) || {};
    const scripts = metadata.script || [];
    return getUsedDeps(deps, scripts, dir);
  }

  return [];
};

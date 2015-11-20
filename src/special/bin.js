import path from 'path';
import yaml from 'js-yaml';

function getObjectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function join(...args) {
  return path.join(...args).replace(/\\/g, '/');
}

function getBin(dir, dependency) {
  const packagePath = path.resolve(dir, 'node_modules', dependency, 'package.json');
  const metadata = require(packagePath);
  return metadata.bin || {};
}

function isUsing(dep, bin, value, scripts) {
  return scripts.some(script =>
    script.indexOf(bin) === 0 ||
    script.indexOf(`$(npm bin)/${bin}`) !== -1 ||
    script.indexOf(`./node_modules/.bin/${bin}`) !== -1 ||
    script.indexOf(join('node_modules', dep, value)) !== -1);
}

function depsUsedByScripts(deps, scripts, dir) {
  return deps.filter(dep => {
    const bin = getBin(dir, dep);
    return Object.keys(bin).some(key =>
      isUsing(dep, key, bin[key], scripts));
  });
}

export default (content, filename, deps, dir) => {
  const basename = path.basename(filename);
  if (basename === 'package.json') {
    const scripts = getObjectValues(JSON.parse(content).scripts || {});
    return depsUsedByScripts(deps, scripts, dir);
  } else if (basename === '.travis.yml') {
    const metadata = yaml.safeLoad(content) || {};
    const scripts = metadata.script || [];
    return depsUsedByScripts(deps, scripts, dir);
  }

  return [];
};

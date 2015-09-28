import path from 'path';
import yaml from 'js-yaml';

function getObjectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function getBin(dir, dependency) {
  const packagePath = path.resolve(dir, 'node_modules', dependency, 'package.json');
  const metadata = require(packagePath);
  return metadata.bin || {};
}

function isUsing(dep, bin, value, scripts) {
  return scripts.some(script =>
    script.indexOf(bin) === 0 ||
    script.indexOf(`./node_modules/.bin/${bin}`) !== -1 ||
    script.indexOf(path.join('node_modules', dep, value) !== -1));
}

function makeRequireNode(dependency) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'require',
    },
    arguments: [
      { value: dependency },
    ],
  };
}

function depsUsedByScripts(deps, scripts, dir) {
  return deps
    .filter(dep => {
      const bin = getBin(dir, dep);
      return Object.keys(bin).some(key =>
        isUsing(dep, key, bin[key], scripts));
    })
    .map(makeRequireNode);
}

export default (content, filename, deps, dir) => {
  const basename = path.basename(filename);
  if (basename === 'package.json') {
    const scripts = getObjectValues(JSON.parse(content).scripts || {});
    return depsUsedByScripts(deps, scripts, dir);
  } else if (path.extname(basename) === '.yml') {
    const scripts = yaml.safeLoad(content).scripts || [];
    return depsUsedByScripts(deps, scripts, dir);
  }

  return {};
};

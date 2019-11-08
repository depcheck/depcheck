import vm from 'vm';

export { default as getScripts } from './get-scripts';

export function readJSON(filePath) {
  return require(filePath); // eslint-disable-line global-require
}

export function evaluate(code) {
  const exports = {};
  const sandbox = {
    exports,
    module: { exports },
  };

  vm.runInNewContext(code, sandbox);

  return sandbox.module.exports;
}

export function loadMetadata(moduleName, rootDir) {
  try {
    const file = require.resolve(`${moduleName}/package.json`, {
      paths: [rootDir],
    });
    return readJSON(file);
  } catch (error) {
    return null;
  }
}

export function tryRequire(module, paths = []) {
  try {
    let moduleName = module;
    if (paths.length > 0) moduleName = require.resolve(moduleName, { paths });
    return require(moduleName); // eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}

export function wrapToArray(obj) {
  if (!obj) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj;
  }

  return [obj];
}

export function wrapToMap(obj) {
  if (!obj) {
    return {};
  }
  return obj;
}

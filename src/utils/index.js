import path from 'path';
import vm from 'vm';

import moduleRoot from './module-root';

export { default as getScripts } from './get-scripts';

export function readJSON(filePath) {
  return require(filePath);
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

function memoize(func, n) {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);

    cache.set(key, result);

    if (cache.size > n) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return result;
  };
}

function loadModuleDataRaw(moduleName, rootDir) {
  try {
    const file = path.join(
      moduleRoot(moduleName, { cwd: rootDir }),
      'package.json',
    );
    return {
      path: path.dirname(file),
      metadata: readJSON(file),
    };
  } catch (_error) {
    return {
      path: null,
      metadata: null,
    };
  }
}

const loadModuleData = memoize(loadModuleDataRaw, 500);

export { loadModuleData };

export function tryRequire(module, paths = []) {
  try {
    let moduleName = module;
    if (paths.length > 0) moduleName = require.resolve(moduleName, { paths });
    return require(moduleName);
  } catch (_e) {
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

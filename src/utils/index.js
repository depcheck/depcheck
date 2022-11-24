import path from 'path';
import vm from 'vm';
import jiti from 'jiti';

const jitiInstance = jiti(__filename);

// Import via Jiti since ESM is not supported yet
const moduleRoot = jitiInstance('module-root').default;

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

export function loadModuleData(moduleName, rootDir) {
  try {
    const file = path.join(moduleRoot(moduleName, { cwd: rootDir }), 'package.json');
    return {
      path: path.dirname(file),
      metadata: readJSON(file),
    };
  } catch (error) {
    console.log(error)
    return {
      path: null,
      metadata: null,
    };
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

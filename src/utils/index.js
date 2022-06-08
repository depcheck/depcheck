import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';

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
    const file = require.resolve(`${moduleName}/package.json`, {
      paths: [rootDir],
    });
    return {
      path: path.dirname(file),
      metadata: readJSON(file),
    };
  } catch (error) {
    return {
      path: null,
      metadata: null,
    };
  }
}

export function requireFile(
  filePath,
  rootDir = process.cwd(),
  paths = undefined,
) {
  const targetRequire = createRequire(path.resolve(rootDir, 'package.json'));
  const contents = targetRequire(targetRequire.resolve(filePath, paths));
  return 'default' in contents ? contents.default : contents;
}

export function tryRequire(module, rootDir, paths) {
  try {
    return requireFile(module, rootDir, paths);
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

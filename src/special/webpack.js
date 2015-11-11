import vm from 'vm';
import path from 'path';

function load(code) {
  const exports = {};
  const sandbox = {
    exports,
    module: { exports },
  };

  vm.runInNewContext(code, sandbox);

  return sandbox.module.exports;
}

export default (content, filepath) => {
  const filename = path.basename(filepath);
  if (filename === 'webpack.config.js') {
    const module = load(content).module || {};
    const loaders = module.loaders || [];

    return loaders.map(item => item.loader);
  }

  return [];
};

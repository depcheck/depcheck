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

function normalizeLoader(deps, loader) {
  const templates = ['*-webpack-loader', '*-web-loader', '*-loader', '*'];
  const names = templates
    .map(template => template.replace('*', loader))
    .filter(name => deps.indexOf(name) !== -1);

  return names[0];
}

export default (content, filepath, deps) => {
  const filename = path.basename(filepath);
  if (filename === 'webpack.config.js') {
    const module = load(content).module || {};
    const loaders = module.loaders || [];

    return loaders.map(item => item.loader)
      .map(loader => normalizeLoader(deps, loader))
      .filter(loader => loader);
  }

  return [];
};

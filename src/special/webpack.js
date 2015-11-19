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

function concat(array, item) {
  return array.concat(item);
}

function duplicate(array, item) {
  return array.indexOf(item) === -1 ? array.concat([item]) : array;
}

function extractLoaders(item) {
  if (item.loader) {
    return item.loader.split('!');
  } else if (item.loaders) {
    return item.loaders;
  }

  return [];
}

function stripQueryParameter(loader) {
  const index = loader.indexOf('?');
  return index === -1 ? loader : loader.substring(0, index);
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

    return loaders.map(extractLoaders)
      .reduce(concat, [])
      .map(loader => stripQueryParameter(loader))
      .map(loader => normalizeLoader(deps, loader))
      .filter(loader => loader)
      .reduce(duplicate, []);
  }

  return [];
};

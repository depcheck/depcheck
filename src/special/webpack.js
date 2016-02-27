import path from 'path';
import lodash from 'lodash';

const loaderTemplates = ['*-webpack-loader', '*-web-loader', '*-loader', '*'];

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
  const name = lodash(loaderTemplates)
    .map(template => template.replace('*', loader))
    .intersection(deps)
    .first();

  return name;
}

function getLoaders(deps, loaders) {
  return lodash(loaders || [])
    .map(extractLoaders)
    .flatten()
    .map(loader => stripQueryParameter(loader))
    .map(loader => normalizeLoader(deps, loader))
    .filter(loader => loader)
    .uniq()
    .value();
}

export default function parseWebpack(content, filepath, deps) {
  const filename = path.basename(filepath);
  if (filename === 'webpack.config.js') {
    const module = require(filepath).module || {};
    const loaders = getLoaders(deps, module.loaders);
    const preLoaders = getLoaders(deps, module.preLoaders);
    const postLoaders = getLoaders(deps, module.postLoaders);
    return loaders.concat(preLoaders).concat(postLoaders);
  }

  return [];
}

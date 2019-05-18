import path from 'path';
import lodash from 'lodash';

const webpackConfigRegex = /webpack(\..+)?\.conf(?:ig|)\.(babel\.)?js/;
const loaderTemplates = ['*-webpack-loader', '*-web-loader', '*-loader', '*'];

function extractLoaders(item) {
  if (typeof item === 'string') {
    return item;
  }

  if (item.loader && typeof item.loader === 'string') {
    return item.loader.split('!');
  }

  if (item.loaders) {
    return item.loaders.map(extractLoaders);
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

function parseWebpack1(module, deps) {
  const loaders = getLoaders(deps, module.loaders);
  const preLoaders = getLoaders(deps, module.preLoaders);
  const postLoaders = getLoaders(deps, module.postLoaders);
  return [...loaders, ...preLoaders, ...postLoaders];
}

function mapRuleUse(module) {
  return module.rules
    // filter use or loader because 'loader' is a shortcut to 'use'
    .filter(rule => rule.use || rule.loader)
    // return coerced array, using the relevant key
    .map(rule => [].concat(rule.use || rule.loader));
}

function parseWebpack2(module, deps) {
  if (!module.rules) {
    return [];
  }

  const mappedLoaders = module.rules.filter(rule => rule.loaders);
  const mappedUses = mapRuleUse(module);
  const loaders = getLoaders(deps, lodash.flatten([...mappedLoaders, ...mappedUses]));
  return loaders;
}

export default function parseWebpack(content, filepath, deps) {
  const filename = path.basename(filepath);
  if (webpackConfigRegex.test(filename)) {
    const module = require(filepath).module || {}; // eslint-disable-line global-require

    const webpack1Loaders = parseWebpack1(module, deps);
    const webpack2Loaders = parseWebpack2(module, deps);
    return [...webpack1Loaders, ...webpack2Loaders];
  }

  return [];
}

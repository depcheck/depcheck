/* eslint-disable no-console */

import path from 'path';
import lodash from 'lodash';

const webpackConfigRegex = /webpack(\..+)?\.config\.(babel\.)?js/;
const loaderTemplates = ['*-webpack-loader', '*-web-loader', '*-loader', '*'];

function extractLoaders(item) {
  if (item.loader && typeof item.loader === 'string') {
    return item.loader.split('!');
  } else if (item.loader && typeof item.loader === 'object') {
    return item.loader;
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

function parseWebpack1(module, deps) {
  const loaders = getLoaders(deps, module.loaders);
  const preLoaders = getLoaders(deps, module.preLoaders);
  const postLoaders = getLoaders(deps, module.postLoaders);
  return [...loaders, ...preLoaders, ...postLoaders];
}

function mapRuleLoaders(module) {
  return module.rules
    .filter(rule => rule.loaders)
    .map(rule => rule.loaders.map(loader => ({
      loader,
    })));
}

function mapRuleUse(module) {
  return module.rules
    // filter use or loader (loader is a shortcut to use)
    .filter(rule => rule.use || rule.loader)
    .map((rule) => {
      const key = rule.use ? 'use' : 'loader';
      const coercedArray = [].concat(rule[key]);

      // if it's an array, apply the two rules above for each element
      return coercedArray.map((value) => {
        if (typeof value === 'object') {
          return value;
        }

        return {
          loader: value,
        };
      });
    });
}

function parseWebpack2(module, deps) {
  if (!module.rules) {
    return [];
  }

  return getLoaders(deps, lodash.flatten([...mapRuleLoaders(module), ...mapRuleUse(module)]));
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

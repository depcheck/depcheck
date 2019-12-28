import path from 'path';
import lodash from 'lodash';
import { tryRequire } from '../utils';

const webpackConfigRegex = /webpack(\..+)?\.conf(?:ig|)\.(babel\.)?[jt]s/;
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
    .map((template) => template.replace('*', loader))
    .intersection(deps)
    .first();
  return name;
}

function getLoaders(deps, loaders) {
  return lodash(loaders || [])
    .map(extractLoaders)
    .flatten()
    .map((loader) => stripQueryParameter(loader))
    .map((loader) => normalizeLoader(deps, loader))
    .filter((loader) => loader)
    .uniq()
    .value();
}

function getBabelPresets(deps, loaders) {
  return lodash(loaders || [])
    .filter(
      (item) =>
        typeof item !== 'string' &&
        item.loader &&
        item.loader === 'babel-loader' &&
        item.options &&
        item.options.presets &&
        Array.isArray(item.options.presets),
    )
    .map((item) => item.options.presets)
    .flatten()
    .map((preset) =>
      Array.isArray(preset) && preset.length > 0 ? preset[0] : preset,
    )
    .filter((preset) => typeof preset === 'string')
    .intersection(deps)
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
  return (
    module.rules
      // filter use or loader because 'loader' is a shortcut to 'use'
      .filter((rule) => rule.use || rule.loader)
      // return coerced array, using the relevant key
      .map((rule) => [].concat(rule.use || rule.loader))
  );
}

function parseWebpack2(module, deps) {
  if (!module.rules) {
    return [];
  }

  const mappedLoaders = module.rules.filter((rule) => rule.loaders);
  const mappedUses = mapRuleUse(module);
  const mapped = lodash.flatten([...mappedLoaders, ...mappedUses]);
  const loaders = getLoaders(deps, mapped);
  const presets = getBabelPresets(deps, mapped);
  return [...loaders, ...presets];
}

function extractEntries(entries) {
  if (typeof entries === 'string') {
    return [entries];
  }

  if (Array.isArray(entries)) {
    return entries.filter((entry) => typeof entry === 'string');
  }

  return Object.values(entries)
    .filter((entry) => entry)
    .map(extractEntries);
}

function parseEntries(entries, deps) {
  return lodash(extractEntries(entries))
    .flatten()
    .intersection(deps)
    .uniq()
    .value();
}

export default function parseWebpack(_content, filepath, deps) {
  const filename = path.basename(filepath);
  if (webpackConfigRegex.test(filename)) {
    const wpConfig = tryRequire(filepath);
    if (wpConfig) {
      const module = wpConfig.module || {};
      const entry = wpConfig.entry || [];

      const webpack1Loaders = parseWebpack1(module, deps);
      const webpack2Loaders = parseWebpack2(module, deps);
      const webpackEntries = parseEntries(entry, deps);
      return [...webpack1Loaders, ...webpack2Loaders, ...webpackEntries];
    }
  }

  return [];
}

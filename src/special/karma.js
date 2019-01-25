import fs from 'fs';
import path from 'path';
import resolve from 'resolve';
import { evaluate } from '../utils';

// TODO support karma.conf.coffee
const supportedConfNames = [
  'karma.conf.js',
  'karma.conf.ts',
  '.config/karma.conf.js',
  '.config/karma.conf.ts',
];

function parseConfig(content) {
  try {
    const confSetter = evaluate(content);
    let conf = {};
    confSetter({
      set(c) {
        conf = c;
      },
    });
    return conf;
  } catch (error) {
    // not valid JavaScript code
  }

  // parse fail, return nothing
  return {};
}

function wrapToArray(obj) {
  if (!obj) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj;
  }

  return [obj];
}

function wrapToMap(obj) {
  if (!obj) {
    return {};
  }
  return obj;
}
function collectInstalledPluginInfo(karmaPluginsInstalled, rootDir) {
  const pluginInfo = {};
  karmaPluginsInstalled.forEach((plugin) => {
    const packageMain = resolve.sync(plugin, { basedir: rootDir });
    const packageContents = fs.readFileSync(packageMain, { encoding: 'utf-8' });
    const p = evaluate(packageContents);
    Object.keys(p).forEach((k) => {
      pluginInfo[k] = plugin;
    });
  });
  return pluginInfo;
}

function collectInstalledPluginOfType(type, pluginInfo) {
  const pluginMapping = {};
  const prefix = `${type}:`;
  Object.keys(pluginInfo).filter(k => k.startsWith(prefix)).forEach((k) => {
    const pluginName = k.replace(prefix, '');
    pluginMapping[pluginName] = pluginInfo[k];
  });
  return pluginMapping;
}

function collectFrameworks(config, pluginInfo) {
  // karma-x plugins define frameworks using the structure { 'framework:<name>': ['factory', f] }
  // generate a lookup map { '<name>': 'karma-x', ... }
  const frameworkMapping = collectInstalledPluginOfType('framework', pluginInfo);
  const installedFrameworks = Object.keys(frameworkMapping);
  // config defines a property frameworks: ['<name>',...]
  return wrapToArray(config.frameworks)
    .filter(name => installedFrameworks.includes(name))
    .map(name => frameworkMapping[name]);
}

function collectBrowsers(config, pluginInfo) {
  // karma-x-launcher plugins define browsers using the structure
  // { 'launcher:<name>': ['type', f], ... }
  // generate a lookup map { '<name>': 'karma-x-launcher', ... }
  const launcherMapping = collectInstalledPluginOfType('launcher', pluginInfo);
  const installedBrowsers = Object.keys(launcherMapping);
  // config defines a property browsers: ['<name>',...]
  return [...new Set(wrapToArray(config.browsers)
    .filter(name => installedBrowsers.includes(name))
    .map(name => launcherMapping[name]))];
}

function collectReporters(config, pluginInfo) {
  // some reporters are added by frameworks, so don't filter on only '-reporter' plugins
  // generate a lookup map { '<name>': 'karma-x', ... }
  const reporterMapping = collectInstalledPluginOfType('reporter', pluginInfo);
  const installedReporters = Object.keys(reporterMapping);
  // config defines a property reporters: ['<name>', ...]
  return Object.values(wrapToMap(config.reporters))
    .filter(name => installedReporters.includes(name))
    .map(name => reporterMapping[name]);
}

function collectPreprocessors(config, pluginInfo) {
  // karma-x plugins define preprocessors using the structure
  // { 'preprocessor:<name>': ['type', f], ... }
  // generate a lookup map { '<name>': 'karma-x', ... }
  const preprocessorMapping = collectInstalledPluginOfType('preprocessor', pluginInfo);
  const installedPreprocessors = Object.keys(preprocessorMapping);
  // config defines a property preprocessors: {'<file-glob>': '<name>'}, ... }
  return [...new Set(Object.values(wrapToMap(config.preprocessors))
    .filter(name => installedPreprocessors.includes(name))
    .map(name => preprocessorMapping[name]))];
}

function collectExplicitPlugins(config) {
  // config defines a property frameworks: [x,...] where x is either
  // a string name, or an inline plugin
  // any inline plugin definitions don't matter here - their require/
  // import statements will be handled through other code
  return wrapToArray(config.plugins)
    .filter(pluginDef => typeof pluginDef === 'string');
}

function collectUsages(config, karmaPluginsInstalled, rootDir) {
  const pluginInfo = collectInstalledPluginInfo(karmaPluginsInstalled, rootDir);
  return [].concat(collectFrameworks(config, pluginInfo))
    .concat(collectBrowsers(config, pluginInfo))
    // TODO add support for Express middleware plugins
    // .concat(collectMiddleware(config, pluginInfo))
    .concat(collectPreprocessors(config, pluginInfo))
    .concat(collectReporters(config, pluginInfo));
}

export default function parseKarma(content, filePath, deps, rootDir) {
  const resolvedConfigPaths = supportedConfNames.map(name => path.resolve(rootDir, name));
  if (!resolvedConfigPaths.includes(filePath)) {
    return [];
  }
  const config = parseConfig(content);
  // possibly unused plugins
  const karmaPluginsInstalled = deps.filter(dep => dep.startsWith('karma-')).concat(collectExplicitPlugins(config));
  return collectUsages(config, karmaPluginsInstalled, rootDir);
}

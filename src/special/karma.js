import path from 'path';
import { evaluate, tryRequire } from '../utils';

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

function collectFrameworks(config, karmaPluginsInstalled) {
  // karma-x plugins define frameworks using the structure { 'framework:<name>': ['factory', f] }
  // generate a lookup map { '<name>': 'karma-x', ... }
  const frameworkMapping = {};
  // skip plugins with more specific names, such as launchers and reporters
  karmaPluginsInstalled.filter(plugin => !plugin.endsWith('-launcher') && !plugin.endsWith('-reporter')).forEach((genericPlugin) => {
    const p = tryRequire(genericPlugin);
    if (p != null) {
      Object.keys(p).filter(k => k.startsWith('framework:')).forEach((k) => {
        const frameworkName = k.replace('framework:', '');
        frameworkMapping[frameworkName] = genericPlugin;
      });
    }
  });
  const installedFrameworks = Object.keys(frameworkMapping);
  // config defines a property frameworks: ['<name>',...]
  return wrapToArray(config.frameworks)
    .filter(name => installedFrameworks.includes(name))
    .map(name => frameworkMapping[name]);
}

function collectBrowsers(config, karmaPluginsInstalled) {
  // karma-x-launcher plugins define browsers using the structure
  // { 'launcher:<name>': ['type', f], ... }
  // generate a lookup map { '<name>': 'karma-x-launcher', ... }
  const launcherMapping = {};
  karmaPluginsInstalled.filter(plugin => plugin.endsWith('-launcher')).forEach((launcherPlugin) => {
    const p = tryRequire(launcherPlugin);
    if (p != null) {
      Object.keys(p).filter(k => k.startsWith('launcher:')).forEach((k) => {
        const browserName = k.replace('launcher:', '');
        launcherMapping[browserName] = launcherPlugin;
      });
    }
  });
  const installedBrowsers = Object.keys(launcherMapping);
  // config defines a property browsers: ['<name>',...]
  return [...new Set(wrapToArray(config.browsers)
    .filter(name => installedBrowsers.includes(name))
    .map(name => launcherMapping[name]))];
}

function collectReporters(config, karmaPluginsInstalled) {
  // some reporters are added by frameworks, so don't filter on only '-reporter' plugins
  // generate a lookup map { '<name>': 'karma-x', ... }
  const reporterMapping = {};
  // skip plugins with more specific names, such as launchers
  karmaPluginsInstalled.filter(plugin => !plugin.endsWith('-launcher')).forEach((genericPlugin) => {
    const p = tryRequire(genericPlugin);
    if (p != null) {
      Object.keys(p).filter(k => k.startsWith('reporter:')).forEach((k) => {
        const name = k.replace('reporter:', '');
        reporterMapping[name] = genericPlugin;
      });
    }
  });
  const installedReporters = Object.keys(reporterMapping);
  // config defines a property reporters: ['<name>', ...]
  return Object.values(wrapToMap(config.reporters))
    .filter(name => installedReporters.includes(name))
    .map(name => reporterMapping[name]);
}

function collectPreprocessors(config, karmaPluginsInstalled) {
  // karma-x plugins define preprocessors using the structure
  // { 'preprocessor:<name>': ['type', f], ... }
  // generate a lookup map { '<name>': 'karma-x', ... }
  const preprocessorMapping = {};
  // skip plugins with more specific names, such as launchers and reporters
  karmaPluginsInstalled.filter(plugin => !plugin.endsWith('-launcher') && !plugin.endsWith('-reporter')).forEach((genericPlugin) => {
    const p = tryRequire(genericPlugin);
    if (p != null) {
      Object.keys(p).filter(k => k.startsWith('preprocessor:')).forEach((k) => {
        const name = k.replace('preprocessor:', '');
        preprocessorMapping[name] = genericPlugin;
      });
    }
  });
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

function collectUsages(config, karmaPluginsInstalled) {
  return [].concat(collectFrameworks(config, karmaPluginsInstalled))
    .concat(collectBrowsers(config, karmaPluginsInstalled))
    // TODO add support for Express middleware plugins
    // .concat(collectMiddleware(config, karmaPluginsInstalled))
    .concat(collectPreprocessors(config, karmaPluginsInstalled))
    .concat(collectReporters(config, karmaPluginsInstalled));
}

export default function parseKarma(content, filePath, deps, rootDir) {
  const resolvedConfigPaths = supportedConfNames.map(name => path.resolve(rootDir, name));
  if (!resolvedConfigPaths.includes(filePath)) {
    return [];
  }
  const config = parseConfig(content);
  // possibly unused plugins
  const karmaPluginsInstalled = deps.filter(dep => dep.startsWith('karma-')).concat(collectExplicitPlugins(config));
  return collectUsages(config, karmaPluginsInstalled);
}

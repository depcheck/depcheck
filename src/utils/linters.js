import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import { evaluate } from '.';

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    // not JSON format
  }

  try {
    return yaml.safeLoad(content);
  } catch (error) {
    // not YAML format
  }

  try {
    return evaluate(`module.exports = ${content}`);
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
  if (lodash.isArray(obj)) {
    return obj;
  }

  return [obj];
}

function isLinterConfigAnAbsolutePath(specifier) {
  return path.isAbsolute(specifier);
}

function isLinterConfigARelativePath(specifier) {
  return lodash.startsWith(specifier, './') || lodash.startsWith(specifier, '../');
}

function isLinterConfigFromAPlugin(specifier) {
  return lodash.startsWith(specifier, 'plugin:');
}

function isLinterConfigFromAScopedModule(specifier) {
  return lodash.startsWith(specifier, '@');
}

function isLinterConfigFromAFullyQualifiedModuleName(specifier, prefix) {
  return lodash.startsWith(specifier, prefix);
}

function resolvePresetPackage(flavour, preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (isLinterConfigAnAbsolutePath(preset)) {
    return preset;
  }
  if (isLinterConfigARelativePath(preset)) {
    return path.resolve(rootDir, preset);
  }

  const { prefix, specifier } = (
    isLinterConfigFromAPlugin(preset)
      ? { prefix: `${flavour}-plugin-`, specifier: preset.substring(preset.indexOf(':') + 1) }
      : { prefix: `${flavour}-config-`, specifier: preset }
  );

  if (isLinterConfigFromAScopedModule(specifier)) {
    const scope = specifier.substring(0, specifier.indexOf('/'));
    const module = specifier.substring(specifier.indexOf('/') + 1);

    if (isLinterConfigFromAFullyQualifiedModuleName(module, prefix)) {
      return specifier;
    }
    return `${scope}/${prefix}${module}`;
  }
  if (isLinterConfigFromAFullyQualifiedModuleName(specifier, prefix)) {
    return specifier;
  }
  return `${prefix}${specifier}`;
}

function loadConfig(preset, rootDir) {
  const presetPath = path.isAbsolute(preset)
    ? preset
    : path.resolve(rootDir, 'node_modules', preset);

  try {
    return require(presetPath); // eslint-disable-line global-require
  } catch (error) {
    return {}; // silently return nothing
  }
}

function checkConfig(flavour, config, rootDir) {
  const parser = wrapToArray(config.parser);
  const plugins = wrapToArray(config.plugins).map(plugin => `${flavour}-plugin-${plugin}`);

  const presets = wrapToArray(config.extends)
    .filter(preset => preset !== `${flavour}:recommended`)
    .map(preset => resolvePresetPackage(flavour, preset, rootDir));

  const presetPackages = presets
    .filter(preset => !path.isAbsolute(preset))
    .map(requirePackageName);

  const presetDeps = lodash(presets)
    .map(preset => loadConfig(preset, rootDir))
    .map(presetConfig => checkConfig(flavour, presetConfig, rootDir))
    .flatten()
    .value();

  return lodash.union(parser, plugins, presetPackages, presetDeps);
}

export default function parseLinter(flavour, content, filename, deps, rootDir) {
  const basename = path.basename(filename);
  const filenameRegex = new RegExp(`^\\.${flavour}rc(\\.json|\\.js|\\.yml|\\.yaml)?$`);
  if (filenameRegex.test(basename)) {
    const config = parse(content);
    return checkConfig(flavour, config, rootDir);
  }

  return [];
}

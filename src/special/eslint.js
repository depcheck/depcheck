import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import { evaluate } from '../utils';

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
  } else if (lodash.isArray(obj)) {
    return obj;
  }

  return [obj];
}

function isEslintConfigAnAbsolutePath(specifier) {
  return path.isAbsolute(specifier);
}

function isEslintConfigARelativePath(specifier) {
  return lodash.startsWith(specifier, './') || lodash.startsWith(specifier, '../');
}

function isEslintConfigFromAPlugin(specifier) {
  return lodash.startsWith(specifier, 'plugin:');
}

function isEslintConfigFromAScopedModule(specifier) {
  return lodash.startsWith(specifier, '@');
}

function isEslintConfigFromAFullyQualifiedModuleName(specifier, prefix) {
  return lodash.startsWith(specifier, prefix);
}

function resolvePresetPackage(preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (isEslintConfigAnAbsolutePath(preset)) {
    return preset;
  }
  if (isEslintConfigARelativePath(preset)) {
    return path.resolve(rootDir, preset);
  }

  const { prefix, specifier } = (
    isEslintConfigFromAPlugin(preset)
    ? { prefix: 'eslint-plugin-', specifier: preset.substring(preset.indexOf(':') + 1) }
    : { prefix: 'eslint-config-', specifier: preset }
  );

  if (isEslintConfigFromAScopedModule(specifier)) {
    const scope = specifier.substring(0, specifier.indexOf('/'));
    const module = specifier.substring(specifier.indexOf('/') + 1);

    if (isEslintConfigFromAFullyQualifiedModuleName(module, prefix)) {
      return specifier;
    }
    return `${scope}/${prefix}${module}`;
  }
  if (isEslintConfigFromAFullyQualifiedModuleName(specifier, prefix)) {
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

function checkConfig(config, rootDir) {
  const parser = wrapToArray(config.parser);
  const plugins = wrapToArray(config.plugins).map(plugin => `eslint-plugin-${plugin}`);

  const presets = wrapToArray(config.extends)
    .filter(preset => preset !== 'eslint:recommended')
    .map(preset => resolvePresetPackage(preset, rootDir));

  const presetPackages = presets
    .filter(preset => !path.isAbsolute(preset))
    .map(requirePackageName);

  const presetDeps = lodash(presets)
    .map(preset => loadConfig(preset, rootDir))
    .map(presetConfig => checkConfig(presetConfig, rootDir))
    .flatten()
    .value();

  return lodash.union(parser, plugins, presetPackages, presetDeps);
}

export default function parseESLint(content, filename, deps, rootDir) {
  const basename = path.basename(filename);
  if (/^\.eslintrc(\.json|\.js|\.yml|\.yaml)?$/.test(basename)) {
    const config = parse(content);
    return checkConfig(config, rootDir);
  }

  return [];
}

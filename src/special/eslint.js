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
  return specifier.startsWith('./') || specifier.startsWith('../');
}

function isEslintConfigAScopedModule(specifier) {
  return specifier.startsWith('@');
}

function isEslintConfigAFullyQualifiedModuleName(specifier) {
  return specifier.startsWith('eslint-config-');
}

function resolvePresetPackage(preset, rootDir) {
  if (isEslintConfigAnAbsolutePath(preset)) {
    return preset;
  }
  if (isEslintConfigARelativePath(preset)) {
    return path.resolve(rootDir, preset);
  }
  if (isEslintConfigAScopedModule(preset)) {
    const scope = preset.substring(0, preset.indexOf('/'));
    const module = preset.substring(preset.indexOf('/') + 1);

    if (isEslintConfigAFullyQualifiedModuleName(module)) {
      return preset;
    }
    return `${scope}/eslint-config-${module}`;
  }
  if (isEslintConfigAFullyQualifiedModuleName(preset)) {
    return preset;
  }
  return `eslint-config-${preset}`;
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

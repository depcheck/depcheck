import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import evaluate from '../utils/evaluate';

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

function resolvePresetPackage(preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (path.isAbsolute(preset)) {
    return preset;
  } else if (!/\w|@/.test(preset.charAt(0))) { // first letter is not letter or '@'
    return path.resolve(rootDir, preset);
  } else if (preset.charAt(0) === '@') {
    throw new Error('Not support scoped package in ESLint config.'); // TODO implementation
  } else if (preset.indexOf('eslint-config-') === 0) {
    return preset;
  } else { // eslint-disable-line no-else-return
    return `eslint-config-${preset}`;
  }
}

function loadConfig(preset, rootDir) {
  const presetPath = path.isAbsolute(preset)
    ? preset
    : path.resolve(rootDir, 'node_modules', preset);

  try {
    return require(presetPath);
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

export default (content, filename, deps, rootDir) => {
  const basename = path.basename(filename);
  if (basename === '.eslintrc') {
    const config = parse(content);
    return checkConfig(config, rootDir);
  }

  return [];
};

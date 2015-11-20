import path from 'path';
import yaml from 'js-yaml';
import requirePackageName from 'require-package-name';

import load from '../utils/load';
import discoverPropertyDep from '../utils/discover-property-dep';

function concat(array, item) {
  return array.concat(item);
}

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
    return load(`module.exports = ${content}`);
  } catch (error) {
    // not valid JavaScript code
  }

  // parse fail, return nothing
  return {};
}

function wrapToArray(obj) {
  if (!obj) {
    return [];
  } else if (obj instanceof Array) {
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
    return requirePackageName(preset);
  } else { // eslint-disable-line no-else-return
    return requirePackageName(`eslint-config-${preset}`);
  }
}

function extractPreset(preset, deps, rootDir) {
  // eslint recommended config is handled by ESLint itself
  if (preset === 'eslint:recommended') {
    return [];
  }

  // special check on airbnb config
  if (preset === 'airbnb') {
    return ['eslint-config-airbnb', 'eslint-plugin-react'];
  }

  const presetPackage = resolvePresetPackage(preset, rootDir);
  const peerDeps = discoverPropertyDep(presetPackage, 'peerDependencies', deps, rootDir);
  const optionalDeps = discoverPropertyDep(presetPackage, 'optionalDependencies', deps, rootDir);
  const presetDep = path.isAbsolute(presetPackage) ? [] : [presetPackage];

  return presetDep.concat(peerDeps).concat(optionalDeps);
}

export default (content, filename, deps, rootDir) => {
  const basename = path.basename(filename);
  if (basename === '.eslintrc') {
    const config = parse(content);
    const parser = wrapToArray(config.parser);
    const plugins = wrapToArray(config.plugins).map(plugin => `eslint-plugin-${plugin}`);
    const presets = wrapToArray(config.extends)
      .map(preset => extractPreset(preset, deps, rootDir))
      .reduce(concat, []);

    return parser.concat(plugins).concat(presets);
  }

  return [];
};

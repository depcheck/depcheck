import path from 'path';
import yaml from 'js-yaml';
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

function extractPreset(preset, deps, rootDir) {
  // special check on airbnb config
  if (preset === 'airbnb') {
    return ['eslint-config-airbnb', 'eslint-plugin-react'];
  }

  const presetPackage = `eslint-config-${preset.split('/')[0]}`; // TODO follow ESLint resolve logic
  const peerDeps = discoverPropertyDep(presetPackage, 'peerDependencies', deps, rootDir);
  const optionalDeps = discoverPropertyDep(presetPackage, 'optionalDependencies', deps, rootDir);

  return [presetPackage].concat(peerDeps).concat(optionalDeps);
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

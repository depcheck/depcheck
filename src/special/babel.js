import path from 'path';
import lodash from 'lodash';
import { loadConfig } from '../utils/cli-tools';
import { getContent } from '../utils/file';

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    return {}; // ignore parse error silently
  }
}

function isPlugin(target, plugin) {
  return lodash.isString(target)
    ? target === plugin || target === `babel-plugin-${plugin}`
    : target[0] === plugin || target[0] === `babel-plugin-${plugin}`;
}

function contain(array, dep, prefix, scope) {
  if (!array) {
    return false;
  }

  // extract name if wrapping with options
  const names = array.map((item) => (lodash.isString(item) ? item : item[0]));
  if (names.indexOf(dep) !== -1) {
    return true;
  }

  const fullPrefix = scope ? `${scope}/${prefix}` : prefix;

  if (prefix && dep.indexOf(fullPrefix) === 0) {
    const identifier = dep.substring(fullPrefix.length);
    return contain(array, scope ? `${scope}/${identifier}` : identifier, false);
  }

  return false;
}

function getReactTransforms(deps, plugins) {
  const transforms = lodash(plugins || [])
    .filter((plugin) => isPlugin(plugin, 'react-transform'))
    .map(([, plugin]) => plugin.transforms.map(({ transform }) => transform))
    .first();

  return lodash.intersection(transforms, deps);
}

function filter(deps, options) {
  const presets = deps.filter((dep) =>
    contain(options.presets, dep, 'babel-preset-'),
  );

  const presets7 = deps.filter((dep) =>
    contain(options.presets, dep, 'preset-', '@babel'),
  );

  const plugins = deps.filter((dep) =>
    contain(options.plugins, dep, 'babel-plugin-'),
  );

  const plugins7 = deps.filter((dep) =>
    contain(options.plugins, dep, 'plugin-', '@babel'),
  );

  const reactTransforms = getReactTransforms(deps, options.plugins);

  return lodash.uniq(
    presets.concat(presets7, plugins, plugins7, reactTransforms),
  );
}

function checkOptions(deps, options = {}) {
  const optDeps = filter(deps, options);
  const envDeps = lodash(options.env)
    .values()
    .map((env) => filter(deps, env))
    .flatten()
    .value();

  return optDeps.concat(envDeps);
}

const regex = /^(\.babelrc|babelrc\.js|babel\.config\.js)?$/;

export default async function parseBabel(filename, deps, rootDir) {
  const config = await loadConfig('babel', regex, filename, rootDir);

  if (config) {
    return checkOptions(deps, config);
  }

  if (path.basename(filename) === 'package.json') {
    const content = await getContent(filename);
    const metadata = parse(content);
    return checkOptions(deps, metadata.babel);
  }

  return [];
}

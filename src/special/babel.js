import path from 'path';

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    return {}; // ignore parse error silently
  }
}

function values(object) {
  return Object.keys(object || {}).map(key => object[key]);
}

function contain(array, dep, prefix) {
  if (!array) {
    return false;
  }

  // extract name if wrapping with options
  const names = array.map(item => typeof item === 'string' ? item : item[0]);
  if (names.indexOf(dep) !== -1) {
    return true;
  }

  if (prefix && dep.indexOf(prefix) === 0) {
    return contain(array, dep.substring(prefix.length), false);
  }

  return false;
}

function filter(deps, options) {
  const presets = deps.filter(dep =>
    contain(options.presets, dep, 'babel-preset-'));

  const plugins = deps.filter(dep =>
    contain(options.plugins, dep, 'babel-plugin-'));

  return presets.concat(plugins);
}

function checkOptions(deps, options = {}) {
  const optDeps = filter(deps, options);
  const envDeps = values(options.env).map(env => filter(deps, env))
    .reduce((array, item) => array.concat(item), []);

  return optDeps.concat(envDeps);
}

export default (content, filePath, deps) => {
  const filename = path.basename(filePath);

  if (filename === '.babelrc') {
    const options = parse(content);
    return checkOptions(deps, options);
  }

  if (filename === 'package.json') {
    const metadata = parse(content);
    return checkOptions(deps, metadata.babel);
  }

  return [];
};

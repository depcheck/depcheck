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

export default (content, filename, deps) => {
  if (filename === '.babelrc') {
    const options = JSON.parse(content);

    const presets = deps.filter(dep =>
      contain(options.presets, dep, 'babel-preset-'));

    const plugins = deps.filter(dep =>
      contain(options.plugins, dep, 'babel-plugin-'));

    return presets.concat(plugins);
  }

  return [];
};

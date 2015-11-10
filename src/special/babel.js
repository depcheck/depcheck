function contain(array, dep, prefix) {
  if (!array) {
    return false;
  }

  if (array.indexOf(dep) !== -1) {
    return true;
  }

  if (dep.indexOf(prefix) === 0 &&
      array.indexOf(dep.substring(prefix.length)) !== -1) {
    return true;
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

import path from 'path';

export default (content, filepath, deps, rootDir) => {
  const defaultOptPath = path.resolve(rootDir, 'test/mocha.opts');
  if (filepath === defaultOptPath) {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.indexOf('--require') === 0)
      .map(line => line.substring('--require'.length).trim())
      .filter(name => deps.indexOf(name) !== -1);
  }

  return [];
};

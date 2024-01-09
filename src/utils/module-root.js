import path from 'path';
import callsite from 'callsite';
import findup from 'findup-sync';
import resolveFrom from 'resolve-from';

export default (...args) => {
  const name = args.find((arg) => typeof arg === 'string');
  const options = args.find((arg) => typeof arg === 'object') || {};
  options.cwd = options.cwd || process.cwd();
  try {
    if (name) {
      const fullpath = resolveFrom(options.cwd, name);
      const index = fullpath.lastIndexOf(name.replace(/\//g, path.sep))
      return fullpath.substring(0, index + name.length)
    } else {
      return path.dirname(findup('package.json', { cwd: path.dirname(callsite()[1].getFileName()) }))
    }
  } catch {
    const pkg = resolveFrom(options.cwd, `${name}/package.json`);
    return path.resolve(path.dirname(pkg));
  }
};

import path from 'path';
import callsite from 'callsite';
import findup from 'findup-sync';
import resolveFrom from 'resolve-from';

export default (...args) => {
  const name = args.find((arg) => typeof arg === 'string');
  const options = args.find((arg) => typeof arg === 'object') || {};
  options.cwd = options.cwd || process.cwd();
  let pkg;
  try {
    const fullpath = name
      ? resolveFrom(options.cwd, name)
      : callsite()[1].getFileName();
    pkg = findup('package.json', { cwd: path.dirname(fullpath) });
  } catch {
    pkg = resolveFrom(options.cwd, `${args[0]}/package.json`);
  }
  return path.resolve(path.dirname(pkg));
};

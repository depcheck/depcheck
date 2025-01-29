import path from 'path';
import callsites from 'callsites';
import findup from 'findup-sync';

export default (...args) => {
  const name = args.find(arg => typeof arg === 'string');
  const options = args.find(arg => typeof arg === 'object') || {};
  options.cwd = options.cwd || process.cwd();
  if (name) {
    return findup(path.join('node_modules', ...name.split('/')), { cwd: options.cwd });
  }
  return path.dirname(findup('package.json', { cwd: path.dirname(callsites()[1].getFileName()) }));
};

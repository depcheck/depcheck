import path from 'path';

export default function discover(depName, property, deps, rootDir) {
  try {
    const file = path.resolve(rootDir, 'node_modules', depName, 'package.json');
    const metadata = require(file);
    const propertyDeps = Object.keys(metadata[property] || {});
    return deps.filter(dep => propertyDeps.indexOf(dep) !== -1);
  } catch (error) {
    return [];
  }
}

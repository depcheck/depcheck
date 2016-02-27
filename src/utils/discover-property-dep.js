import path from 'path';
import lodash from 'lodash';

export default function discover(rootDir, deps, property, depName) {
  try {
    const file = path.resolve(rootDir, 'node_modules', depName, 'package.json');
    const metadata = require(file);
    const propertyDeps = Object.keys(metadata[property] || {});
    return lodash.intersection(deps, propertyDeps);
  } catch (error) {
    return [];
  }
}

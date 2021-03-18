import lodash from 'lodash';
import builtInModules from './builtin-modules';

/* eslint-disable import/prefer-default-export */
const orgDepRegex = /@(.*?)\/(.*)/;

// The name of the DefinitelyTyped package for a given package
export function getAtTypesName(dep) {
  let pkgName;
  if (lodash.includes(builtInModules, dep)) {
    pkgName = 'node';
  } else {
    const match = orgDepRegex.exec(dep);
    pkgName = match ? `${match[1]}__${match[2]}` : dep;
  }
  return `@types/${pkgName}`;
}

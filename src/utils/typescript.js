import isCore from '@nolyfill/is-core-module';

/* eslint-disable import/prefer-default-export */
const orgDepRegex = /@(.*?)\/(.*)/;

// The name of the DefinitelyTyped package for a given package
export function getAtTypesName(dep) {
  let pkgName;
  if (isCore(dep)) {
    pkgName = 'node';
  } else {
    const match = orgDepRegex.exec(dep);
    pkgName = match ? `${match[1]}__${match[2]}` : dep;
  }
  return `@types/${pkgName}`;
}

/* eslint-disable import/prefer-default-export */
const orgDepRegex = /@(.*?)\/(.*)/;

// The name of the DefinitelyTyped package for a given package
export function getAtTypesName(dep) {
  const match = orgDepRegex.exec(dep);
  const pkgName = match ? `${match[1]}__${match[2]}` : dep;

  return `@types/${pkgName}`;
}

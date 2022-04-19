import lodash from 'lodash';
import path from 'path';
import requirePackageName from 'require-package-name';

const sass = require('sass');

function unixSlashes(packagePath) {
  return packagePath.replace(/\\/g, '/');
}

// TODO::remove stuff after ':'
function removeNodeModulesOrTildaFromPath(packagePath) {
  let suspectedFileName = packagePath;

  // remove ':'
  const colonsIndex = packagePath.indexOf(':');
  if (colonsIndex > 1) {
    suspectedFileName = suspectedFileName.substring(0, colonsIndex);
  }
  // remove 'node_modules/'
  const nodeModulesIndex = suspectedFileName.indexOf('node_modules/');
  if (nodeModulesIndex > -1) {
    return suspectedFileName.substring(
      nodeModulesIndex + 'node_modules/'.length,
    );
  }

  // remove '~'
  if (suspectedFileName.indexOf(`~`) === 0) {
    return suspectedFileName.substring(1);
  }
  return suspectedFileName;
}

export default async function parseSASS(filename) {
  const includedFiles = [];

  sass.compile(filename, {
    loadPaths: [path.dirname(filename)],
    importers: [
      {
        canonicalize: (importPath) => {
          includedFiles.push(importPath);
          return new URL(`file:${importPath}`);
        },
        load: () => ({
          contents: '',
          syntax: 'css',
        }),
      },
    ],
  });

  const result = lodash(includedFiles)
    .filter((packagePath) => packagePath !== filename)
    .map(unixSlashes)
    .map(removeNodeModulesOrTildaFromPath)
    .map(requirePackageName)
    .uniq()
    .filter(Boolean)
    .value();

  return result;
}

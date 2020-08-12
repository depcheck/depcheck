import path from 'path';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';

const sass = require('sass');

function unixSlashes(packagePath) {
  return packagePath.replace(/\\/g, "/");
}

function removeNodeModulesOrTildaFromPath(packagePath) {
  const nodeModulesIndex = packagePath.indexOf('node_modules/');
  if (nodeModulesIndex > -1) {
    return packagePath.substring(nodeModulesIndex + 'node_modules/'.length);
  }
  if (packagePath.indexOf(`~`) === 0) {
    return packagePath.substring(1);
  }
  return packagePath;
}

export default async function parseSASS(filename) {
  const includedFiles = [];
  let sassDetails = {}; 
  try {
    // sass processor does not respect the custom importer
    sassDetails = sass.renderSync({
      file: filename,
      includePaths: [path.dirname(filename)],
      importer: [
        function importer(url) {
          includedFiles.push(url);
          return {
            contents: `
              h1 {
                font-size: 40px;
              }`,
          };
        },
      ],
    });
  } catch (e) {
    sassDetails.stats = {
      includedFiles,
    };
  }

  const result = lodash(sassDetails.stats.includedFiles)
    .filter((packagePath) => packagePath !== filename)
    .map(unixSlashes)
    .map(removeNodeModulesOrTildaFromPath)
    .map(requirePackageName)
    .uniq()
    .filter((x) => x)
    .value();

  return result;
}

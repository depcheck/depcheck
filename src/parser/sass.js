import path from 'path';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import { tryRequire } from '../utils';

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

const sass = tryRequire('sass');

export default async function parseSASS(filename, deps, rootDir) {
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
      includedFiles
    };
  }

  const result = lodash(sassDetails.stats.includedFiles)
    .map(removeNodeModulesOrTildaFromPath)
    .map(requirePackageName)
    .uniq()
    .filter(x => x)
    .value();

  return result;
}

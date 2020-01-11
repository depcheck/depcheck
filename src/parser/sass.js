import path from 'path';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import tildeImporter from 'node-sass-tilde-importer';
import { tryRequire } from '../utils';

const sass = tryRequire('node-sass');

export default async function parseSASS(filename, deps, rootDir) {
  const { stats } = sass.renderSync({
    file: filename,
    includePaths: [path.dirname(filename)],
    importer: tildeImporter,
  });

  const result = lodash(stats.includedFiles)
    .map((file) => path.relative(rootDir, file))
    .filter((file) => file.indexOf('node_modules') === 0) // refer to node_modules
    .map((file) => file.replace(/\\/g, '/')) // normalize paths in Windows
    .map((file) => file.substring('node_modules/'.length)) // avoid heading slash
    .map(requirePackageName)
    .uniq()
    .value();

  return result;
}

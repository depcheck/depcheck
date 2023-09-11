import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import requirePackageName from 'require-package-name';

const importModuleRegex = /@(?:use|import|forward)\s+['"]([^'"]+)['"]/gm;
// Paths prefixed with "~" or "node_modules/" are both considered paths to external deps in node_modules
const nodeModulePrefixRegex = /^~|^(?:\.[\\/])?node_modules[\\/]/;

/**
 * Sass allows omitting different parts of file path when importing files from relative paths:
 * - relative path prefix can be omitted "./" (Sass tries to import from current file directory first)
 * - underscore "_" prefix of partials can be omitted (https://sass-lang.com/guide/#partials)
 * - sass/scss file extension can be omitted
 * Reference: https://sass-lang.com/documentation/at-rules/import/#finding-the-file
 * This filter checks for existence of a file on every possible relative path and then filters those out.
 */
function isModuleOnRelativePath(filename, importPath) {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return true;
  }

  const basePath = path.dirname(filename);
  const extension = path.extname(filename);
  const pathWithExtension =
    path.extname(importPath) !== '' ? importPath : importPath + extension;
  const pathWithUnderscorePrefix = path.join(
    path.dirname(pathWithExtension),
    `_${path.basename(pathWithExtension)}`,
  );
  const possiblePaths = [
    path.join(basePath, pathWithExtension),
    path.join(basePath, pathWithUnderscorePrefix),
  ];
  return possiblePaths.some((modulePath) => fs.existsSync(modulePath));
}

export default async function parseSASS(filename) {
  const sassString = fs.readFileSync(filename).toString();

  // https://sass-lang.com/documentation/at-rules/import/#load-paths
  const deps = Array.from(sassString.matchAll(importModuleRegex))
    // Pick the matched group
    .map(([, match]) =>
      match.startsWith('sass:')
        ? 'sass' // Add 'sass' dependency for built-in modules
        : match.replace(nodeModulePrefixRegex, ''),
    )
    .filter((importPath) => !isModuleOnRelativePath(filename, importPath))
    .map(requirePackageName);

  return lodash.uniq(deps);
}

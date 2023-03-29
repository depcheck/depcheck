import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import requirePackageName from 'require-package-name';
import sass from 'sass';

const sassModuleRegex = /^\s*@use\s+['"]sass:[a-z]+['"]/gm;

function removeNodeModulesOrTildaFromPath(packagePath) {
  let suspectedFileName = packagePath;

  // remove ':'
  const pathBeforeColon = packagePath.split(':')[0];
  suspectedFileName = pathBeforeColon ?? suspectedFileName;

  // remove 'node_modules/'
  const pathInNodeModules = suspectedFileName.split('node_modules/')[1];
  if (pathInNodeModules) {
    return pathInNodeModules;
  }

  // remove '~'
  if (suspectedFileName.startsWith(`~`)) {
    return suspectedFileName.slice(1);
  }
  return suspectedFileName;
}

/**
 * Prevents sass compilation from crashing when importing missing dep
 * @type {import('sass').Importer}
 */
const missingDepImporter = {
  canonicalize: (importPath) => new URL(`file:${importPath}`),
  load: () => ({ contents: '', syntax: 'css' }),
};

export default async function parseSASS(filename, _deps, rootDir) {
  const modulesDir = path.resolve(rootDir, 'node_modules');
  const filterLocalFile = (filepath) =>
    !(filepath.startsWith(rootDir) && !filepath.startsWith(modulesDir));

  const sassString = fs.readFileSync(filename).toString();
  const usesSass = sassString.match(sassModuleRegex);
  const { loadedUrls } = sass.compileString(sassString, {
    url: new URL(`file:${filename}`),
    syntax: filename.endsWith('scss') ? 'scss' : 'indented',
    importers: [
      {
        findFileUrl(url) {
          const normalizedPath = removeNodeModulesOrTildaFromPath(url);
          return new URL(normalizedPath, `file:${modulesDir}/`);
        },
      },
      missingDepImporter,
    ],
  });

  const result = loadedUrls
    .map((url) => url.pathname)
    .filter((name) => Boolean(name) && name !== filename)
    .filter(filterLocalFile)
    .map(removeNodeModulesOrTildaFromPath)
    // Normalize package name by removing leading slash from URL.pathname
    .map((name) => (name.startsWith('/') ? name.slice(1) : name))
    .map(requirePackageName)
    .concat(usesSass ? ['sass'] : []);

  return lodash.uniq(result);
}

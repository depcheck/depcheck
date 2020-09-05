import path from 'path';
import fs from 'fs';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';

const { parse } = require('scss-parser');
const createQueryWrapper = require('query-ast');
const sass = require('sass');

const IMPORT_RULE_TYPE = 'atrule';

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

function isLocalFile(filePath, folderName) {
  if (filePath[0] === '_') {
    return true;
  }

  if (filePath[0] === '@') {
    return false;
  }

  return fs.existsSync(path.join(folderName, `${filePath}.scss`));
}

function parseSCSS(filename) {
  const folderName = path.dirname(filename);
  const fileContents = fs.readFileSync(filename).toString();
  const ast = parse(fileContents);
  const queryWrapper = createQueryWrapper(ast);
  const imports = queryWrapper(IMPORT_RULE_TYPE).nodes.map(
    (node) => node.children[2].node.value,
  );

  const result = lodash(imports)
    .filter((packagePath) => packagePath !== filename)
    .map(unixSlashes)
    .map(removeNodeModulesOrTildaFromPath)
    .map(requirePackageName)
    .uniq()
    .filter((filePath) => !isLocalFile(filePath, folderName))
    .filter((x) => x)
    .value();

  return result;
}

export default async function parseSASS(filename) {
  const isScss = path.extname(filename) === '.scss';

  if (isScss) {
    return parseSCSS(filename);
  }

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

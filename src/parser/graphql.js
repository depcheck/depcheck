const { readFileSync } = require('fs');
const requirePackageName = require('require-package-name');
const JSON5 = require('json5');

export default function graphqlParser(filePath) {
  const foundDeps = [];
  const content = readFileSync(filePath, { encoding: 'utf8' });
  const lines = content.split(/\r\n|\r|\n/);
  lines.some((line) => {
    if (line[0] === '#' && line.slice(1).split(' ')[0] === 'import') {
      const importFileExpr = line.slice(1).split(' ')[1];
      if (importFileExpr) {
        // Need to support single and double quotes, so use JSON5
        const importFile = JSON5.parse(importFileExpr);
        if (importFile && typeof importFile === 'string') {
          foundDeps.push(importFile);
        }
      }
    }
    return line.length !== 0 && line[0] !== '#';
  });
  return foundDeps.map((p) => requirePackageName(p)).filter(Boolean);
}

const requirePackageName = require('require-package-name');
const { readFileSync } = require('fs');
const JSON5 = require('json5');

export default function tsconfigParser(filePath, deps) {
  const content = readFileSync(filePath, { encoding: 'utf8' });
  const foundDeps = [];
  const tsconfigJson = JSON5.parse(content);
  const types = tsconfigJson.compilerOptions?.types;
  if (types) {
    types.forEach((pkg) => {
      const typesPkg = `@types/${pkg}`;
      if (
        !deps.includes(typesPkg) &&
        (deps.includes(pkg) || /[@/]/.test(pkg))
      ) {
        foundDeps.push(pkg);
      } else {
        foundDeps.push(typesPkg);
      }
    });
  }
  if (tsconfigJson.extends) {
    foundDeps.push(tsconfigJson.extends);
  }
  return foundDeps.map((p) => requirePackageName(p)).filter(Boolean);
}

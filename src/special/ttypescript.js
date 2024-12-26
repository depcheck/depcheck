import lodash from 'lodash';
import path from 'path';
import JSON5 from 'json5';
import { readFileSync } from 'fs';

// Search in all files looking like a TypeScript configuration file.
const tsconfigPattern = /tsconfig(?:\.[^.]+)*\.json/;

function readJSON(filename) {
  const content = readFileSync(filename, { encoding: 'utf8' });
  return JSON5.parse(content);
}

export default function parseTTypeScript(filename, deps) {
  const basename = path.basename(filename);
  if (tsconfigPattern.test(basename)) {
    const content = readJSON(filename) || {};
    if (content.compilerOptions && content.compilerOptions.plugins) {
      return lodash(content.compilerOptions.plugins)
        .filter((plugin) => plugin.transform)
        .map((plugin) => plugin.transform)
        .intersection(deps)
        .uniq()
        .value();
    }
  }
  return [];
}

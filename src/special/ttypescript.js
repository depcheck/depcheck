import lodash from 'lodash';
import path from 'path';
import { readJSON } from '../utils';

// Search in all files looking like a TypeScript configuration file.
const tsconfigPattern = /tsconfig(?:\.[^.]+)*\.json/;

export default function parseTTypeScript(_content, filepath, deps) {
  const filename = path.basename(filepath);
  if (tsconfigPattern.test(filename)) {
    const content = readJSON(filepath) || {};
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

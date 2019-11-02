import * as path from 'path';
import * as fs from 'fs';

export default function parseLintStaged(content, filename) {
  const basename = path.basename(filename);
  const fileContent = content !== null ? content : fs.readFileSync(filename, 'utf-8');

  if (basename === 'package.json') {
    const pkg = JSON.parse(fileContent);
    return pkg['lint-staged'] ? ['lint-staged'] : [];
  }

  return [];
}

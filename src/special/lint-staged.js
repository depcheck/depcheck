import * as path from 'path';

export default function parseLintStaged(content, filename) {
  const basename = path.basename(filename);

  if (basename === 'package.json') {
    const pkg = JSON.parse(content);
    return pkg['lint-staged'] ? ['lint-staged'] : [];
  }

  return [];
}

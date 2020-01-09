import * as path from 'path';

export default function parseHusky(content, filename) {
  const basename = path.basename(filename);

  if (basename === 'package.json') {
    const pkg = JSON.parse(content);
    return pkg.husky ? ['husky'] : [];
  }

  return [];
}

import * as path from 'path';
import { getContent } from '../utils/file';

export default async function parseLintStaged(filename) {
  const basename = path.basename(filename);

  if (basename === 'package.json') {
    const content = await getContent(filename);
    const pkg = JSON.parse(content);
    return pkg['lint-staged'] ? ['lint-staged'] : [];
  }

  return [];
}

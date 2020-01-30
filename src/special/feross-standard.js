import path from 'path';
import { getContent } from '../utils/file';

export default async function parseFerossStandard(filename, deps, rootDir) {
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  const resolvedFilePath = path.resolve(filename);
  if (resolvedFilePath === packageJsonPath && deps.indexOf('standard') !== -1) {
    const content = await getContent(filename);
    const metadata = JSON.parse(content);
    const config = metadata.standard || {};
    const { parser } = config;
    return parser ? [parser] : [];
  }

  return [];
}

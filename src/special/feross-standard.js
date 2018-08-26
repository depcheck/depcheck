import path from 'path';

export default function parseFerossStandard(content, filePath, deps, rootDir) {
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  const resolvedFilePath = path.resolve(filePath);
  if (resolvedFilePath === packageJsonPath && deps.indexOf('standard') !== -1) {
    const metadata = JSON.parse(content);
    const config = metadata.standard || {};
    const { parser } = config;
    return parser ? [parser] : [];
  }

  return [];
}

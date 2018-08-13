import parseLinter from '../utils/linters';

export default function parseTSLint(content, filename, deps, rootDir) {
  return parseLinter('tslint', content, filename, deps, rootDir);
}

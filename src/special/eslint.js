import parseLinter from '../utils/linters';

export default function parseESLint(content, filename, deps, rootDir) {
  return parseLinter('eslint', content, filename, deps, rootDir);
}

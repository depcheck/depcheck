import * as path from 'path';
import { getContent } from '../utils/file';

const ANGULAR_FILES = ['angular-cli.json', 'angular.json'];
const ANGULAR_JSON_KEYS = ['scripts', 'styles', 'assets'];

const traverse = (obj, candidates) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] && typeof obj[k] === 'object') {
      if (ANGULAR_JSON_KEYS.includes(k)) {
        candidates.push(obj[k]);
      }
      traverse(obj[k], candidates);
    }
  });
};

export default async function parseAngular(filename) {
  const basename = path.basename(filename);

  if (ANGULAR_FILES.includes(basename)) {
    const content = await getContent(filename);
    const angularJson = JSON.parse(content);

    let candidates = [];
    traverse(angularJson, candidates);
    candidates = candidates.flat();

    let dependencies = [];
    candidates.forEach((candidate) => {
      const match = candidate.match(
        /node_modules\/([a-zA-Z-])*|@([a-zA-Z-])*\/([a-zA-Z-]*)/g,
      );
      if (match) {
        dependencies.push(match[match.length - 1].replace('node_modules/', ''));
      }
    });
    dependencies = dependencies.filter((d, i) => dependencies.indexOf(d) >= i);

    return dependencies;
  }
  return false;
}

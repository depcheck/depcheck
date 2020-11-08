import path from 'path';
import semver from 'semver';
import { getContent } from '../utils/file';

export default async function parseReact17(filename) {
  if (path.basename(filename) === 'package.json') {
    const content = await getContent(filename);
    const metadata = JSON.parse(content);

    try {
      if (semver.gte(semver.coerce(metadata.dependencies?.react), '17.0.0')) {
        return ['react'];
      }
    } catch {
      return [];
    }
  }

  return [];
}

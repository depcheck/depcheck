import path from 'path';
import { readJSON } from '../utils';

export default function parsePrettier(content, filepath) {
  const filename = path.basename(filepath);
  if (filename === 'package.json') {
    const config = readJSON(filepath);
    if (config && config.prettier && typeof config.prettier === 'string') {
      return [config.prettier];
    }
  }
  return [];
}

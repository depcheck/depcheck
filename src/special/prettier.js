import path from 'path';
import { readJSON } from '../utils';

export default function parsePrettier(filename) {
  if (path.basename(filename) === 'package.json') {
    const config = readJSON(filename);
    if (config && config.prettier && typeof config.prettier === 'string') {
      return [config.prettier];
    }
  }
  return [];
}

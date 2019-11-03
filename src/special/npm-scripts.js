import * as path from 'path';

export default function parseNpmScripts(_, filename) {
  const basename = path.basename(filename);

  if (basename === 'package.json') {
    const event = process.env.npm_lifecycle_event;
    return event ? [event] : [];
  }

  return [];
}

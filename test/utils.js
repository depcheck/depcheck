import path from 'path';
import fs from 'fs';

// eslint-disable-next-line import/prefer-default-export
export function resolveShortPath(expected, module) {
  return Object.keys(expected).reduce((obj, key) => ({
    ...obj,
    [key]: expected[key].map(name =>
      fs.realpathSync(path.resolve(__dirname, 'fake_modules', module, name))),
  }), {});
}

import path from 'path';

export function resolveShortPath(expected, module) {
  return Object.keys(expected).reduce((obj, key) => ({
    ...obj,
    [key]: expected[key].map(name =>
      path.resolve(__dirname, 'fake_modules', module, name)),
  }), {});
}

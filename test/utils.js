import path from 'path';
import fse from 'fs-extra';
import { setContent } from '../src/utils/file';

export function resolveShortPath(expected, module) {
  return Object.keys(expected).reduce(
    (obj, key) => ({
      ...obj,
      [key]: expected[key].map((name) => {
        return path.resolve(__dirname, 'fake_modules', module, name);
      }),
    }),
    {},
  );
}

function random() {
  return Math.random().toString().substring(2);
}

export function getTestParserWithTempFile(parser) {
  return async (content, filename, deps, rootDir) => {
    const tempFolder = path.resolve(rootDir, `temp-${random()}`);
    const tempPath = path.resolve(tempFolder, filename);
    await fse.ensureDir(tempFolder);
    await fse.outputFile(tempPath, content);
    const result = await parser(tempPath, deps, tempFolder);
    const fileFolder = path.dirname(tempPath);
    await fse.remove(tempPath);
    await fse.remove(fileFolder);
    return result;
  };
}

export function getTestParserWithContentPromise(parser) {
  return async (content, filename, deps, rootDir) => {
    setContent(filename, content);
    return parser(filename, deps, rootDir);
  };
}

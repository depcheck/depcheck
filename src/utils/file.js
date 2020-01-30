import fs from 'fs';
import util from 'util';

// TODO: this can later be refactored once support for node 10 is dropped
const readFileAsync = util.promisify(fs.readFile);

const promises = {};

// eslint-disable-next-line import/prefer-default-export
export function getContent(filename) {
  if (!promises[filename]) {
    promises[filename] = readFileAsync(filename, 'utf8');
  }
  return promises[filename];
}

export function setContent(filename, content) {
  promises[filename] = Promise.resolve(content);
}

import fs from 'fs';
import util from 'util';

// TODO: this can later be refactored once support for node 10 is dropped
const readFileAsync = util.promisify(fs.readFile);

const promises = new Map();

// eslint-disable-next-line import/prefer-default-export
export function getContent(filename) {
  if (!promises.has(filename)) {
    promises.set(filename, readFileAsync(filename, 'utf8'));
  }
  return promises.get(filename);
}

export function setContent(filename, content) {
  promises.set(filename, Promise.resolve(content));
}

export function clearContent() {
  promises.clear();
}

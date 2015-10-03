#!/usr/bin/env node

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

function readFile(filePath) {
  return new Promise((resolve, reject) =>
    fs.readFile(filePath, 'utf8', (error, content) =>
      error ? reject(error) : resolve(content)));
}

function writeFile(filePath, content) {
  return new Promise((resolve, reject) =>
    fs.writeFile(filePath, content, error =>
      error ? reject(error) : resolve()));
}

const version = process.env.TRAVIS_TAG || '0.0.1';
const packagePath = path.resolve(__dirname, '../package.json');

console.log(`Patch version ${version} to package.json file`);

readFile(packagePath)
.then(content =>
  Object.assign(JSON.parse(content), { version }))
.then(json =>
  writeFile(packagePath, JSON.stringify(json, null, 2) + '\n'))
.then(() => process.exit(0), error => {
  console.error(error);
  process.exit(-1);
});

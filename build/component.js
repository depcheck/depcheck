#!/usr/bin/env node

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

function unify(list) {
  return list.map(item => path.basename(item, '.js'));
}

function getList(name) {
  return new Promise(resolve =>
    fs.readdir(path.resolve(__dirname, '../src', name), (error, list) =>
      resolve(error ? error : unify(list))));
}

Promise.all([
  getList('parser'),
  getList('detector'),
]).then(([
  parser,
  detector,
]) => console.log(JSON.stringify({
  parser,
  detector,
}, null, 2)));

#!/usr/bin/env node

require('please-upgrade-node')(require('../package.json'));

/* eslint-disable no-console, global-require, import/no-extraneous-dependencies */

let cli;
try {
  cli = require('../dist/cli');
} catch (e) {
  require('@babel/register')({
    extends: require('path').resolve(__dirname, '../.babelrc'),
    ignore: [],
  });
  cli = require('../src/cli');
}

cli(process.argv.slice(2), console.log, console.error, function exit(code) {
  process.exitCode = code;
});

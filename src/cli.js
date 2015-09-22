#!/usr/bin/env node

/* eslint-disable no-console */

import optimist from 'optimist';

var opt = optimist
  .usage('Usage: $0 [DIRECTORY]')
  .boolean('dev')
  .default('dev', true)
  .describe('no-dev', 'Don\'t look at devDependecies')
  .describe('json', 'Output results to JSON')
  .describe('ignores', 'Comma separated package list to ignore')
  .describe('help', 'Show this help message');

var argv = opt.argv;

if (argv.help) {
  console.log(opt.help());
  process.exit(0);
}

var checkDirectory = require('./index');
var fs = require('fs');
var path = require('path');
var dir = argv._[0] || '.';
var absolutePath = path.resolve(dir);

function run() {
  checkDirectory(absolutePath, {
    "withoutDev": !argv.dev,
    "ignoreMatches": (argv.ignores || "").split(","),
  }, unused => {
    if (argv.json) {
      console.log(JSON.stringify(unused));
      return process.exit(0);
    }

    if (unused.dependencies.length === 0 && unused.devDependencies.length === 0) {
      console.log('No unused dependencies');
      process.exit(0);
    } else {
      if (unused.dependencies.length !== 0) {
        console.log('Unused Dependencies');
        unused.dependencies.forEach(u => {
          console.log('* ' + u);
        });
      }
      if (unused.devDependencies.length !== 0) {
        console.log();
        console.log('Unused devDependencies');
        unused.devDependencies.forEach(u => {
          console.log('* ' + u);
        });
      }
      process.exit(-1);
    }
  });
}

fs.exists(absolutePath, pathExists => {
  if (pathExists) {
    fs.exists(absolutePath + path.sep + 'package.json', exists => {
      if (exists) {
        run();
      } else {
        console.error('Path ' + dir + ' does not contain a package.json file');
        opt.showHelp();
        process.exit(-1);
      }
    });
  } else {
    console.error('Path ' + dir + ' does not exist');
    process.exit(-1);
  }
});

#!/usr/bin/env node

require('please-upgrade-node')(require('../package.json'));

require('../dist/cli')(
  process.argv.slice(2),
  console.log,
  console.error,
  function exit(code) {
    process.exitCode = code;
  },
);

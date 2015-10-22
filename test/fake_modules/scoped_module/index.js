/* eslint-disable no-unused-vars */

/**
 * This covers various ways module names can be found in require statements.
 * Module names are extracted using https://github.com/mattdesl/require-package-name
 */

const pkg = require('@owner/package');
const anotherPackage = require('@secondowner/package');
const childDep = require('@org/parent/child');
const name = require('name-import/name');
const deepName = require('child-import/deep/name');

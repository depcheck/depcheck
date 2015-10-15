/*
 * Require number is used in minify tools (e.g., browserify, webpack).
 * However, number is not a valid package for NPM.
 * Reference: https://docs.npmjs.com/files/package.json#name
 */

require(1);
require(2);
require(3);

/**
 * I am using this file to avoid false alert in this project.
 * It is not good, however it works.
 * The typescript and node-sass are parsers as peer dependencies.
 * However, because of NPM's bug, it is blocking users.
 * They are only mentioned in README and declared in devDependencies for testing.
 * Reference: https://github.com/depcheck/depcheck/issues/130
 */
import 'node-sass';
import 'typescript';
import 'appveyor-runner';

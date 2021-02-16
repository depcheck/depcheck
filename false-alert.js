/**
 * This file exists to help avoid false alerts when running depcheck on itself
 * as a build step, particularly in CI.
 */

/**
 * These packages are used as optional peer dependencies
 * Because of inconsistenties in npm behavior over time, depcheck
 * cannot model the way these deps are required or used.
 * For more information: https://github.com/depcheck/depcheck/issues/130
 */
import 'node-sass';

/**
 * Recongnize the required module by nyc. See depcheck/depcheck#183
 */
import '@babel/polyfill';
import '@babel/register';

/**
 * Typescript is loaded using tryRequire and is therefore not detected.
 */
import 'typescript';

/**
 * This file exists to help avoid false alerts when running depcheck on itself
 * as a build step, particularly in CI.
 */

/**
 * Recongnize the required module by nyc. See depcheck/depcheck#183
 */
import '@babel/polyfill';
import '@babel/register';
/**
 * TypeScript is loaded using tryRequire and is therefore not detected.
 */
import 'typescript';

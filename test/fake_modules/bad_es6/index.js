/* eslint-disable no-unused-vars, id-length */

/**
 * This should cover all styles of ES6 imports as described by:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
 */

import 'find-me';
import name from 'name-import';
import * as star from 'star-import';
import { member } from 'member-import';
import { foobar as barfoo } from 'member-alias-import';
import { foo, bar } from 'multiple-member-import';
import { a, b as c } from 'mixed-member-alias-import';
import d, { e } from 'mixed-name-memeber-import';
import h, * as i from 'mixed-default-star-import';
import j from 'default-member-import';

/**
 * This should cover all styles of "re-exporting"
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
 */

export * from 'star-export';
export { name1, name2 } from 'named-export';
export { importA as nameA, importB as nameB } from 'member-alias-export';
export { default } from 'default-export';

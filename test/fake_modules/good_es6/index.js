/* eslint-disable no-unused-vars, id-length */

/**
 * This should cover (nearly) all ES6 import syntaxes as described by:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
 */

import 'basic-import';
import name from 'name-import';
import * as star from 'star-import';
import { member } from 'member-import';
import { foobar as barfoo } from 'member-alias-import';
import { foo, bar } from 'multiple-member-import';
import { a, b as c } from 'mixed-member-alias-import';
import d, { e } from 'mixed-name-memeber-import';
import h, * as i from 'mixed-default-star-import';
import j from 'default-member-import';

// import 'unsupportedSyntax' as seeBelow;
/*
 * The import syntax shown on MDN as `import 'module-name' as name;` is
 * currently unsupported.
 *
 * This is due to it being unsupported by the JavaScript parsing libraries that
 * we use.
 *
 * Additionally, this syntax is not supported by Babel (currently), so we felt
 * that it was reasonable to not support it at this time. We've left this here
 * for future reference.
 *
 * https://github.com/lijunle/depcheck-es6/pull/7
 */

/**
 * This should cover all styles of "re-exporting"
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
 */

export * from 'star-export';
export { name1, name2 } from 'named-export';
export { importA as nameA, importB as nameB } from 'member-alias-export';
export { default } from 'default-export';

// @flow
/* eslint-disable no-unused-vars */

// This file includes some experimental ES7 syntax enabled in Babel by default. Reference: https://babeljs.io/docs/usage/experimental/

import 'ecmascript-rest-spread';

type TestType = {
  x: Number,
  y: Number,
  x: Number,
};

const test: TestType = {
  x: 1,
  y: 2,
  z: 3,
};

const objectRestSpread = {
  ...test,
  spec: 'https://github.com/sebmarkbage/ecmascript-rest-spread',
};

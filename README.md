# depcheck-es6

[![build status](https://secure.travis-ci.org/lijunle/depcheck-es6.svg?branch=master)](http://travis-ci.org/lijunle/depcheck-es6)
[![Coverage Status](https://coveralls.io/repos/lijunle/depcheck-es6/badge.svg?branch=master&service=github)](https://coveralls.io/github/lijunle/depcheck-es6?branch=master)
[![Dependency Status](https://david-dm.org/lijunle/depcheck-es6.svg)](https://david-dm.org/lijunle/depcheck-es6)
[![devDependency Status](https://david-dm.org/lijunle/depcheck-es6/dev-status.svg)](https://david-dm.org/lijunle/depcheck-es6#info=devDependencies)

*Note*: Fork from rumpl's [depcheck](https://github.com/rumpl/depcheck) package and provide ES6 and continuous features support. This fork is fully backward compatible with depcheck.

Keeping track of your dependencies is not an easy task, especially if you have a big application.
Are you sure you are using all of the dependencies you define in your `package.json` file? One way to find out is to
look at all your files and check which modules you are using, but that's too time consuming. Or maybe you can do a
`grep` on all the files of your project, and then some `grep -v` to remove the junk. But that's a hassle too.

And that is why `depcheck` exists.

It's a nifty little tool that looks at your `package.json` file and scans your code in order to find any unused
dependencies.

## Installation

```
npm install depcheck-es6 -g
```

## Usage

As easy as **depcheck [DIRECTORY]**.

Where DIRECTORY is the root directory of your application (where the package.json is).
This will list all the unused dependencies in your code if any.

### Options

`--no-dev` : by default `depcheck` looks at `dependencies` and `devDependencies`, this flag will tell it not to look at "devDependencies".

`--json` : output results to JSON.

`--ignores`: a comma separated package list to ignore. It could be glob expressions.

Or, as a lib:
```javascript
var path = require("path");
var depcheck = require("depcheck-es6");
var options = {
  "withoutDev": false, // Check against devDependencies too
  "ignoreDirs": [      // Pathnames to ignore
    "sandbox",
    "dist",
    "bower_components"
  ],
  "ignoreMatches": [  // Ignore dependencies that match these minimatch patterns
    "grunt-*"
  ]
};
var root = path.resolve("some path");

depcheck(root, options, function(unused) {
  console.log(unused.dependencies);
  console.log(unused.devDependencies);
  console.log(unused.invalidFiles); // JavaScript files that cannot parse
  console.log(unused.invalidDirs); // directories that cannot access
});
```

## License

MIT License.

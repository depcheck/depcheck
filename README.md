# depcheck

Keeping track of your dependencies is not an easy task, especially if you have a big project. Are you sure you are using all of the dependencies you define in your `package.json` file? One way to find out is to look at all your files and check which modules you are using, but that's too time consuming. Or maybe you can do a `grep` on all the files of your project, and then some `grep -v` to remove the junk. But that's a hassle too.

And that is why `depcheck` exists - it's a nifty little tool that looks at your project files and scans your code in order to find any unused dependencies.

## Build Status

[![Build Status](https://travis-ci.org/depcheck/depcheck.svg?branch=master)](https://travis-ci.org/depcheck/depcheck)
[![Build status](https://ci.appveyor.com/api/projects/status/xbooh370dinuyi0y/branch/master?svg=true)](https://ci.appveyor.com/project/lijunle/depcheck/branch/master)
[![codecov.io](https://codecov.io/github/depcheck/depcheck/coverage.svg?branch=master)](https://codecov.io/github/depcheck/depcheck?branch=master)

[![Dependency Status](https://david-dm.org/depcheck/depcheck.svg)](https://david-dm.org/depcheck/depcheck)
[![devDependency Status](https://david-dm.org/depcheck/depcheck/dev-status.svg)](https://david-dm.org/depcheck/depcheck#info=devDependencies)

## Features

- Support ES5, ES6, ES7, JSX and CoffeeScript syntax.
- Detect using ESLint configuration preset, parser and plugins.
- Detect using Webpack loaders.
- Detect Babel presets and plugins.
- Recognize the packages used in `grunt.tasks.loadNpmTasks` call.
- Smart to identify the binary package used in commands.

## Installation

```
npm install depcheck -g
```

## Usage

```
depcheck [directory] [arguments]
```

The `directory` argument is the root directory of your project (where the `package.json` file is). It will be the current directory when not specified.

All the arguments are optional:

`--dev=[true|false]`: A flag indicates if depcheck looks at `devDependencies`. By default, it is `true`. It means, depcheck looks at both `dependencies` and `devDependencies`.

`--ignore-bin-package=[true|false]`: A flag indicates if depcheck ignores the packages containing bin entry. The default value is `true`.

`--json`: Output results to JSON. When not specified, depcheck outputs in human friendly format.

`--ignores`: A comma separated array containing package names to ignore. It can be glob expressions. Example, `--ignores=eslint,babel`.

`--ignores-dirs`: A comma separated array containing directory names to ignore. Example, `--ignore-dirs=dist,coverage`.

`--help`: Show the help message.

`--parsers`, `--detectors` and `--specials`: These arguments are for advanced usage. They provide an easy way to customize the file parser and dependency detection. Check [the pluggable design document](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md) for more information.

## API

Want to call depcheck from code? See the example:

```js
var path = require('path');
var depcheck = require('depcheck');

var options = {
  withoutDev: false, // check against devDependencies
  ignoreBinPackage: false, // ignore the packages with bin entry
  ignoreDirs: [ // folder with these names will be ignored
    'sandbox',
    'dist',
    'bower_components'
  ],
  ignoreMatches: [ // ignore dependencies that matches these globs
    'grunt-*'
  ],
  parsers: { // the target parsers
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx
  },
  detectors: [ // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration
  ],
  specials: [ // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack
  ]
};

depcheck('/path/to/your/project', options, function(unused) {
  console.log(unused.dependencies); // an array containing the unused dependencies
  console.log(unused.devDependencies); // an array containing the unused devDependencies
  console.log(unused.invalidFiles); // files that cannot access or parse
  console.log(unused.invalidDirs); // directories that cannot access
});
```

## License

MIT License.

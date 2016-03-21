# depcheck

Depcheck is a tool to analysis the dependencies in a project, and figures out which dependencies are useless, which dependencies are missing in `package.json`, how does each dependencies is used.

## Status

[![Build Status](https://travis-ci.org/depcheck/depcheck.svg?branch=master)](https://travis-ci.org/depcheck/depcheck)
[![Build status](https://ci.appveyor.com/api/projects/status/xbooh370dinuyi0y/branch/master?svg=true)](https://ci.appveyor.com/project/lijunle/depcheck/branch/master)
[![codecov.io](https://codecov.io/github/depcheck/depcheck/coverage.svg?branch=master)](https://codecov.io/github/depcheck/depcheck?branch=master)
[![depcheck](https://depcheck.tk/github/depcheck/depcheck/master.svg)](https://github.com/depcheck/depcheck)

[![Dependency Status](https://david-dm.org/depcheck/depcheck.svg)](https://david-dm.org/depcheck/depcheck)
[![devDependency Status](https://david-dm.org/depcheck/depcheck/dev-status.svg)](https://david-dm.org/depcheck/depcheck#info=devDependencies)
[![peerDependency Status](https://david-dm.org/depcheck/depcheck/peer-status.svg)](https://david-dm.org/depcheck/depcheck#info=peerDependencies)

## Installation

```
npm install -g depcheck
```

*Notice:* depcheck needs node.js >= 0.12.

## Syntax Support

Depcheck not only recognizes the dependencies in JavaScript file, but also supports these syntaxes:

- JavaScript (ES5, ES6 and ES7)
- React JSX
- CoffeeScript
- Typescript (by `typescript` as peer dependency)
- SASS and SCSS (by `node-sass` as peer dependency)

To get the syntax support by peer dependency, please install the corresponding package explicitly. For example, for Typescript user, install depcheck with `typescript` package:

```
npm install -g depcheck typescript
```

## Special

The *special* is a component used to recognize the dependencies not generally used in the above syntax files. The following scenarios are supported by specials:

- Dependencies used in npm commands, Travis scripts or other CI scripts
- ESLint configuration presets, parsers and plugins
- Webpack loaders
- Babel presets and plugins
- Grunt plugins
- Feross standard format parser
- Mocha explicit required dependencies

The logic of a special is not perfect. There might be [false alerts](#false-alert). If it happens, please open an issue for us.

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

Similar options are provided to `depcheck` function for programming.

```js
import depcheck from 'depcheck';

const options = {
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
    '**/*.js': depcheck.parser.es6,
    '**/*.jsx': depcheck.parser.jsx
  },
  detectors: [ // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration
  ],
  specials: [ // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack
  ],
};

depcheck('/path/to/your/project', options, (unused) => {
  console.log(unused.dependencies); // an array containing the unused dependencies
  console.log(unused.devDependencies); // an array containing the unused devDependencies
  console.log(unused.missing); // an array containing the dependencies missing in `package.json`
  console.log(unused.using); // a lookup indicating each dependency is used by which files
  console.log(unused.invalidFiles); // files that cannot access or parse
  console.log(unused.invalidDirs); // directories that cannot access
});
```

## Example

The following example checks the dependencies under `/path/to/my/project` folder.

```sh
$> depcheck /path/to/my/project
Unused dependencies
* underscore
Unused devDependencies
* jasmine
Missing dependencies
* lodash
```

It figures out:

- The dependency `underscore` is declared in the `package.json` file, but not used by any code.
- The devDependency `jasmine` is declared in the `package.json` file, but not used by any code.
- The dependency `lodash` is used somewhere in the code, but not declared in the `package.json` file.

Please note that, if a subfolder has a `package.json` file, it is considered another project and should be checked with another depcheck command.

The following example checks the same project, however, outputs as a JSON blob. Depcheck's JSON output is in one single line for easy pipe and computation. The [`json`](https://www.npmjs.com/package/json) command after the pipe is a node.js program to beautify the output.

```js
$> depcheck /path/to/my/project --json | json
{
  "dependencies": [
    "underscore"
  ],
  "devDependencies": [
    "jasmine"
  ],
  "missing": {
    "lodash": [
      "/path/to/my/project/file.using.lodash.js"
    ]
  },
  "using": {
    "react": [
      "/path/to/my/project/file.using.react.jsx",
      "/path/to/my/project/another.file.using.react.jsx"
    ],
    "lodash": [
      "/path/to/my/project/file.using.lodash.js"
    ]
  },
  "invalidFiles": {
    "/path/to/my/project/file.having.syntax.error.js": "SyntaxError: <call stack here>"
  },
  "invalidDirs": {
    "/path/to/my/project/folder/without/permission": "Error: EACCES, <call stack here>"
  }
}
```

- The `dependencies`, `devDependencies` and `missing` properties have the same meanings in the previous example.
- The `using` property is a lookup indicating each dependency is used by which files.
- The value of `missing` and `using` lookup is an array. It means the dependency may be used by many files.
- The `invalidFiles` property contains the files having syntax error or permission error. The value is the error details. However, only one error is stored in the lookup.
- The `invalidDirs` property contains the directories having permission error. The value is the error details.

## False Alert

Depcheck just walks through all files and try to figure out the dependencies according to some predefined rules. However, the predefined rules may not enough or even be wrong.

There may be some cases that, a dependency is using but reported as unused, or a dependency is not used but reported as missing. These are *false alert* situations.

If you find that depcheck is reporting a false alert, please [open an issue](https://github.com/depcheck/depcheck/issues/new) with the following information to let us know:

- The output from `depcheck --json` command. Beautified JSON is better.
- Which dependencies are considered as false alert?
- How are you using those dependencies, how do the files look like?

## License

MIT License.

# depcheck

Depcheck is a tool for analyzing the dependencies in a project to see: how each dependency is used, which dependencies are useless, and which dependencies are missing from `package.json`.

## Status

[![Build Status](https://github.com/depcheck/depcheck/workflows/ci/badge.svg)](https://github.com/depcheck/depcheck/actions)
[![Financial Contributors on Open Collective](https://opencollective.com/depcheck/all/badge.svg?label=financial+contributors)](https://opencollective.com/depcheck) [![Build status](https://ci.appveyor.com/api/projects/status/xbooh370dinuyi0y/branch/master?svg=true)](https://ci.appveyor.com/project/lijunle/depcheck/branch/master)
[![codecov.io](https://codecov.io/github/depcheck/depcheck/coverage.svg?branch=master)](https://codecov.io/github/depcheck/depcheck?branch=master)

[![dependencies Status](https://david-dm.org/depcheck/depcheck/status.svg)](https://david-dm.org/depcheck/depcheck)
[![devDependencies Status](https://david-dm.org/depcheck/depcheck/dev-status.svg)](https://david-dm.org/depcheck/depcheck?type=dev)

## Installation

```
npm install -g depcheck
```

Or simply using [npx](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner) which is a package runner bundled in `npm`:

```
$ npx depcheck
```

_Notice:_ depcheck needs node.js >= 10.

## Syntax Support

Depcheck not only recognizes the dependencies in JavaScript files, but also supports these syntaxes:

- JavaScript (ES5, ES6 and ES7)
- [React JSX](http://facebook.github.io/react/docs/jsx-in-depth.html)
- [CoffeeScript](http://coffeescript.org/)
- [Typescript](http://www.typescriptlang.org/) (with `typescript` dependency)
- [SASS and SCSS](http://sass-lang.com/) (with `node-sass` dependency)
- [Vue.js](https://vuejs.org/) (with `@vue/compiler-sfc` dependency)

To get the syntax support by external dependency, please install the corresponding package explicitly. For example, for Typescript user, install depcheck with `typescript` package:

```
npm install -g depcheck typescript
```

## Special

The _special_ component is used to recognize the dependencies that are not generally used in the above syntax files. The following scenarios are supported by specials:

- `babel` - [Babel](https://www.npmjs.com/package/babel) presets and plugins
- `bin` - Dependencies used in npm commands, Travis scripts or other CI scripts
- `commitizen` - [Commitizen](https://www.npmjs.com/package/commitizen) configuration adaptor
- `eslint` - [ESLint](https://www.npmjs.com/package/eslint) configuration presets, parsers and plugins
- `feross-standard` - [Feross standard](https://www.npmjs.com/package/standard) format parser
- `gatsby` - [Gatsby](https://www.npmjs.com/package/gatsby) configuration parser
- `gulp-load-plugins` - [Gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) lazy loaded plugins
- `husky` - [Husky](https://www.npmjs.com/package/husky) configuration parser
- `istanbul` - [Istanbul nyc](https://www.npmjs.com/package/nyc) configuration extensions
- `jest` - [Jest](https://www.npmjs.com/package/jest) properties in [Jest Configuration](https://jestjs.io/docs/en/configuration)
- `karma` - [Karma](https://www.npmjs.com/package/karma) configuration frameworks, browsers, preprocessors and reporters
- `lint-staged` - [Lint-staged](https://www.npmjs.com/package/lint-staged) configuration parser
- `mocha` - [Mocha](https://www.npmjs.com/package/mocha) explicit required dependencies
- `prettier` - [Prettier](https://www.npmjs.com/package/prettier) configuration module
- `tslint` - [TSLint](https://www.npmjs.com/package/tslint) configuration presets, parsers and plugins
- `ttypescript` - [ttypescript](https://github.com/cevek/ttypescript) transformers
- `webpack` - [Webpack](https://www.npmjs.com/package/webpack) loaders
- `serverless`- [Serverless](https://www.npmjs.com/package/serverless) plugins

The logic of a special is not perfect. There might be [false alerts](#false-alert). If this happens, please open an issue for us.

## Usage

```
depcheck [directory] [arguments]
```

The `directory` argument is the root directory of your project (where the `package.json` file is). If unspecified, defaults to current directory.

All of the arguments are optional:

`--ignore-bin-package=[true|false]`: A flag to indicate if depcheck ignores the packages containing bin entry. The default value is `false`.

`--skip-missing=[true|false]`: A flag to indicate if depcheck skips calculation of missing dependencies. The default value is `false`.

`--json`: Output results in JSON. When not specified, depcheck outputs in human friendly format.

`--ignores`: A comma separated array containing package names to ignore. It can be glob expressions. Example, `--ignores="eslint,babel-*"`.

`--ignore-dirs`: DEPRECATED, use ignore-patterns instead. A comma separated array containing directory names to ignore. Example, `--ignore-dirs=dist,coverage`.

`--ignore-path`: Path to a file with patterns describing files to ignore. Files must match the .gitignore [spec](http://git-scm.com/docs/gitignore). Example, `--ignore-path=.eslintignore`.

`--ignore-patterns`: Comma separated patterns describing files to ignore. Patterns must match the .gitignore [spec](http://git-scm.com/docs/gitignore). Example, `--ignore-patterns=build/Release,dist,coverage,*.log`.

`--help`: Show the help message.

`--parsers`, `--detectors` and `--specials`: These arguments are for advanced usage. They provide an easy way to customize the file parser and dependency detection. Check [the pluggable design document](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md) for more information.

`--config=[filename]`: An external configuration file (see below).

## Usage with a configuration file

Depcheck can be used with an rc configuration file. In order to do so, create a .depcheckrc file in your project's package.json folder, and set the CLI keys in YAML, JSON, and Javascript formats.
For example, the CLI arguments `--ignores="eslint,babel-*" --skip-missing=true` would turn into:

**_.depcheckrc_**

```
ignores: ["eslint", "babel-*"]
skip-missing: true
```

**Important:** if provided CLI arguments conflict with configuration file ones, the CLI ones will take precedence over the rc file ones.

The rc configuration file can also contain the following extensions: `.json`, `.yaml`, `.yml`.

## API

Similar options are provided to `depcheck` function for programming:

```js
import depcheck from 'depcheck';

const options = {
  ignoreBinPackage: false, // ignore the packages with bin entry
  skipMissing: false, // skip calculation of missing dependencies
  ignorePatterns: [
    // files matching these patterns will be ignored
    'sandbox',
    'dist',
    'bower_components',
  ],
  ignoreMatches: [
    // ignore dependencies that matches these globs
    'grunt-*',
  ],
  parsers: {
    // the target parsers
    '**/*.js': depcheck.parser.es6,
    '**/*.jsx': depcheck.parser.jsx,
  },
  detectors: [
    // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration,
  ],
  specials: [
    // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack,
  ],
  package: {
    // may specify dependencies instead of parsing package.json
    dependencies: {
      lodash: '^4.17.15',
    },
    devDependencies: {
      eslint: '^6.6.0',
    },
    peerDependencies: {},
    optionalDependencies: {},
  },
};

depcheck('/path/to/your/project', options).then((unused) => {
  console.log(unused.dependencies); // an array containing the unused dependencies
  console.log(unused.devDependencies); // an array containing the unused devDependencies
  console.log(unused.missing); // a lookup containing the dependencies missing in `package.json` and where they are used
  console.log(unused.using); // a lookup indicating each dependency is used by which files
  console.log(unused.invalidFiles); // files that cannot access or parse
  console.log(unused.invalidDirs); // directories that cannot access
});
```

## Example

The following example checks the dependencies under `/path/to/my/project` folder:

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

Depcheck just walks through all files and tries to find the dependencies according to some predefined rules. However, the predefined rules may not be enough or may even be wrong.

There may be some cases in which a dependency is being used but is reported as unused, or a dependency is not used but is reported as missing. These are _false alert_ situations.

If you find that depcheck is reporting a false alert, please [open an issue](https://github.com/depcheck/depcheck/issues/new) with the following information to let us know:

- The output from `depcheck --json` command. Beautified JSON is better.
- Which dependencies are considered as false alert?
- How are you using those dependencies, what do the files look like?

## Changelog

We use the [GitHub release page](https://github.com/depcheck/depcheck/releases) to manage changelog.

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/depcheck/depcheck/graphs/contributors"><img src="https://opencollective.com/depcheck/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/depcheck/contribute)]

#### Individuals

<a href="https://opencollective.com/depcheck"><img src="https://opencollective.com/depcheck/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/depcheck/contribute)]

<a href="https://opencollective.com/depcheck/organization/0/website"><img src="https://opencollective.com/depcheck/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/1/website"><img src="https://opencollective.com/depcheck/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/2/website"><img src="https://opencollective.com/depcheck/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/3/website"><img src="https://opencollective.com/depcheck/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/4/website"><img src="https://opencollective.com/depcheck/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/5/website"><img src="https://opencollective.com/depcheck/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/6/website"><img src="https://opencollective.com/depcheck/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/7/website"><img src="https://opencollective.com/depcheck/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/8/website"><img src="https://opencollective.com/depcheck/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/depcheck/organization/9/website"><img src="https://opencollective.com/depcheck/organization/9/avatar.svg"></a>

## License

MIT License.

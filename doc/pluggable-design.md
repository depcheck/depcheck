# Pluggable design

Pluggable design is to make the depcheck flexible. The design allows user to customize the syntax parsing, dependencies package detection.

Here is the normal depcheck workflow:

```
walk files under directory -> parse file -> detect packages it used
```

There are three parts in the workflow: _walk files_, _parse file_ and _detect packages_. The second and third part can be customized with **parser** and **detection**.

## Parser

Parser is a function to parse file content to its abstract syntax tree (aka, AST).

Depcheck ships the default JavaScript file parser as `depcheck.parser.es6` and the JSX file parser as `depcheck.parser.jsx`.

### Use Parser From API

Depcheck API accepts `parsers` property to specify the parsers. The syntax looks like:

```js
var opts = {
  parsers: {
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx,
    '*.json': [depcheck.parser.json, customJsonParser],
  },
};
```

The `parsers` option accepts an object. The object key is a glob pattern. The value is the corresponding parser function or parser function array. Only the file whose name matches the glob pattern will be converted to ASTs by the corresponding parsers.

When a file name matches multiple glob patterns, or the glob corresponds to a parser array, the file will be handled by these parsers one by one to generate multiple ASTs.

Here is the default `parsers` option value when user not specify explicitly:

```js
var opts = {
  parsers: {
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx,
  },
};
```

### Use Parser From CLI

From CLI, user can only specify the out-of-box parsers. The CLI evaluates the value from `--parsers` argument, then convert it into _glob-parser_ pairs. The syntax of `--parsers` argument looks like this:

```
--parsers="*.js:es6,*.jsx:jsx,*.json:json1&json2"
```

The quote mark (`"`) wrapping the value is to avoid the start mark (`*`) be parsed by CLI.

As shown from the example, each _glob-parser_ pair is concatenate with comma (`,`). For the glob corresponds to multiple parsers, concatenate them with `&` mark. Each parser name needs to match the parsers shipped under `depcheck.parser`.

The above CLI argument is equivalent to the following API options:

```js
var opts = {
  parsers: {
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx,
    '*.json': [depcheck.parser.json1, depcheck.parser.json2],
  },
};
```

### Implement Custom Parser

Because the parser is just a normal JavaScript function. Everybody can implement its own syntax parser, then pass its own parser via API.

The interface of a parser looks like:

```js
function customerParser(content) {
  return ast || ['package', 'name', 'array'];
}
```

There are two return value type can be handled by depcheck. The first type is AST. When implement your own AST, please follow [ESTree Spec](https://github.com/estree/estree), and provides `type` properties in your [node objects](https://github.com/estree/estree/blob/master/spec.md#node-objects).

The second option is plain string array. The string array indicates these packages **is used** by the file. Depcheck will mark these packages as dependencies and **skip the detector step**.

On the parse error case, throw `SyntaxError` exception and depcheck will capture it and store it to the `invalidFiles` property in the result. When multiple parse error happens, _only one_ error is stored in the `invalidFiles` property.

## Detector

After the file content is converted into an AST, the detectors are responsible to walk on each AST nodes to report dependency packages.

Depcheck ships these detectors:

- `requireCallExpression` detector for `require` function
- `importDeclaration` detector for ES6 `import` declaration
- `exportDeclaration` detector for ES6 `export ... from` declaration
- `gruntLoadTaskCallExpression` detector for `grunt.tasks.loadNpmTasks` function
- `expressViewEngine` detector for Express [view engine](https://expressjs.com/en/guide/using-template-engines.html)

### Use Detector From API

Depcheck API exposes the `detectors` property in options to specify detectors.

Here is the default `detectors` option value:

```js
const opts = {
  detectors: [
    depcheck.detector.requireCallExpression,
    depcheck.detector.requireResolveCallExpression,
    depcheck.detector.importDeclaration,
    depcheck.detector.exportNamedDeclaration,
    depcheck.detector.gruntLoadTaskCallExpression, // for backward compatible
  ],
};
```

The `detectors` option accepts an array of detectors. **All** successful converted ASTs will be examined by **all** detectors one by one.

### Use Detector From CLI

Depcheck CLI provides `--detectors` argument to specify out-of-box detectors. The syntax looks like:

```
--detectors=requireCallExpression,anotherDetector
```

Each detector is concatenated with comma mark (`,`).

The above CLI argument is equivalent to the following API options:

```js
var opts = {
  detectors: [
    depcheck.detector.requireCallExpression,
    depcheck.detector.anotherDetector,
  ],
};
```

### Implement Custom Detector

Detector is a JavaScript function accepts an AST node and package dependencies and returns an array of dependency package names.

The following code snippet is the ES6 `import` declaration detector:

```js
function importDeclarationDetector(node, deps) {
  return node.type === 'ImportDeclaration' && node.source && node.source.value
    ? [node.source.value]
    : [];
}
```

The returning array provides a chance to detect multiple dependencies from one node. The might be useful when handle Webpack or Babel configuration file.

The package dependencies is passed into the detector. It provides the ability to figure out undetermined dependencies. For example, [webpack loader](http://webpack.github.io/docs/using-loaders.html#configuration) has a naming convention to strip out the `-loader` from the package name. So, from the source code aspect (the node object), it cannot figure out the dependency names. However, diff the candidates with the package dependencies, we are getting the answer.

Please ensure your detector test node type before evaluate it - AST's `node.type` property is a good entry for your detector. Besides, do **not** throw exceptions from detector, the exception will be ignored and treat detector is returning an empty array.

## Special Parser

Special parser is one kind of parser, but it is _special_.

Usually, we find the using dependencies from source codes. But, sometimes, it is easier to target a specified dependency, then find whether it is used in the codes or not. That is the situation our _special_ parser comes in.

**Every** file will be passed to **every** special parser for evaluation. The special parser reports the dependency packages from files.

### Use Special Parser From API

Depcheck API exposes `specials` property, which accepts an array, in options to specify special parsers. The syntax look like:

```js
var opts = {
  specials: [depcheck.special.eslint, depcheck.special.webpack],
};
```

### Use Special Parser From CLI

Depcheck CLI exposes `--specials` argument to specify out-of-box special parsers. The syntax looks like:

```
--specials=bin,eslint
```

The above example is equivalent to the following API options:

```js
var opts = {
  specials: [depcheck.special.bin, depcheck.special.eslint],
};
```

### Implement Custom Special Parser

Special parser is just one kind of parsers. It has the same interface with parser, with more arguments. The following code snippet is a special parser for [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) package:

```js
function airbnbEslintConfig(content, filePath, deps, dir) {
  var filename = path.basename(filePath);
  if (filename === '.eslintrc' && deps.indexOf('eslint-config-airbnb') !== -1) {
    var eslintConfig = JSON.parser(content);
    if (eslintConfig.extends === 'airbnb') {
      return [
        'eslint-config-airbnb',
        'eslint',
        'babel-eslint',
        'eslint-plugin-react',
      ];
    }
  }

  return [];
}
```

As seen from the code snippet, there are four parameters passed into the _special_ parser:

- Content, same as normal parser, the file content.
- FilePath, the file path, use `path.basename` to retrieve the file name.
- Deps, an array containing the package dependencies.
- Dir, the checking root directory passed from API or CLI.

Pay attention that, special parser will match **all** files, please do file path or file name matching **by yourself** and only parse content only when necessary. In regards to the returning value, both AST node or plain string array are OK as a normal parser.

---

If you have any ideas or suggestions, please [open an issue](https://github.com/depcheck/depcheck/issues/new).

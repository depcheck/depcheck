# depcheck [![build status](https://secure.travis-ci.org/rumpl/depcheck.png)](http://travis-ci.org/rumpl/depcheck)

Keeping track of your dependencies is not an easy task, especially if you have a big application.
Are you sure you are using all of the dependencies you define in your `package.json` file? One way to find out is to
look at all your files and check which modules you are using, but that's too time consuming. Or maybe you can do a
`grep` on all the files of your project, and then some `grep -v` to remove the junk. But that's a hassle too.

And that is why `depcheck` exists.

It's a nifty little tool that looks at your `package.json` file and scans your code in order to find any unused
dependencies.

Using grunt ? Checkout the [grunt plugin](https://github.com/rumpl/grunt-depcheck).

## Installation

`npm install depcheck -g`

## Usage

As easy as **depcheck [DIRECTORY]**.

Where DIRECTORY is the root directory of your application (where the package.json is).
This will list all the unused dependencies in your code if any.

### Options

`--no-dev` : by default `depcheck` looks at `dependencies` and `devDependencies`, this flag will tell it not to look at "devDependencies".
`--json` : output results to JSON

Or, as a lib:
```javascript
var path = require("path");
var depcheck = require("depcheck");
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
  console.log(unused.invalidFiles); // JS files that couldn't be parsed
});
```

## TODOs

Well, it's more of a "What do you think guys?".

There are a couple of things I would like to do if anyone is interested:

 - There could be false positives, we could have a white list of modules that
you know you are using and that `depcheck` can't find in your code

## License

[MIT](http://rumpl.mit-license.org)

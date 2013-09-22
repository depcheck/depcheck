# depcheck

[![build status](https://secure.travis-ci.org/rumpl/depcheck.png)](http://travis-ci.org/rumpl/depcheck)

Easily check your npm dependencies in order to get rid of unused ones. Bonus: it checks for `grunt.loadNpmTasks` and `grunt.tasks.loadNpmTasks` too, so there shouldn't be any false positives.

## Installation

`npm install depcheck -g`

## Usage

As easy as `depcheck [DIRECTORY]`.

Where DIRECTORY is the root directory of your application (where the package.json is).

This will list all the unused dependencies in your code if any.

**Options**: 

`-dev` : by default `depcheck` looks only at "dependencies", this flag will tell it to look at "devDependencies" too.

## Future

Well, it's more of a "What do you think guys?".

There are a couple of things I would like to do if anyone is interested:

 - There could be false positives, we could have a white list of modules that you know you are using and that `depcheck` can't find in your code
 - A `grunt-contrib-depcheck` would be nice

## License

[MIT](http://mit-license.org/rumpl)

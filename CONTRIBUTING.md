# Contributing

We love contribution from everyone. Please open an issue if you encounter a bug, or have feature requests, or get a documentation issue, or anything.

Issues tagged with [help-wanted](https://github.com/depcheck/depcheck/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3A%22help+wanted%22+) are desired to get support.

## Setup machine

Clone the repository, install the npm dependencies. That is all:

```sh
git clone https://github.com/depcheck/depcheck.git
cd depcheck
npm install
```

## Design

Please read and understand the [pluggable design](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md) if you are going to implement new features.

Basically, it divides the depcheck process into three steps handled by different components.

1. Walk the files under the depcheck directory, managed by depcheck itself.
2. Parse file to abstract syntax tree (aka, AST), handled by [parser](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md#parser). Besides, dependencies can be reported directly with [special parser](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md#special-parser).
3. Detect dependencies from AST, handled by [detector](https://github.com/depcheck/depcheck/blob/master/doc/pluggable-design.md#detector).

## Test driven

Run test:

```sh
npm run test
```

All modification should have test to support it and avoid regression if possible.

Depcheck API and CLI test cases are defined in [spec.json](https://github.com/depcheck/depcheck/blob/master/test/spec.json). Special parsers test cases are defined in [their own test files](https://github.com/depcheck/depcheck/tree/master/test/special).

## Code style

Run code style check:

```sh
npm run lint
```

This project follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), and is enforced by [eslint-config-airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) preset.

It is a must to pass code style check when you do code modifications.

## Self check

Run self check commands:

```sh
npm run depcheck
npm run depcheck-json
```

To be a better tool, we decide to eat our own dog food. Self check will check the unused dependencies in this project.

It might get false alerts or regressions if introducing new features. Some could be skipped using `--ignores` parameter as a workaround, some should be fixed to avoid broking existing features. Please let us know if you get into such situation.

## Pull request

Please rebase to the top main branch when sending a pull request. Both Travis and AppVeyor check should be passed.

Test coverage is minor. However, if there is a huge effect on test coverage, we could take a look.

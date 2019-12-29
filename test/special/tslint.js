import 'should';
import yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import tslintSpecialParser from '../../src/special/tslint';

const testCases = [
  {
    name: 'ignore when user not extends any config in `tslint.json`',
    content: {},
    expected: ['tslint'],
  },
  {
    name: 'skip single built-in config',
    content: {
      extends: 'tslint:recommended',
    },
    expected: ['tslint'],
  },
  {
    name: 'skip built-in configs',
    content: {
      extends: ['tslint:recommended', 'tslint:latest', 'tslint:foo'],
    },
    expected: ['tslint'],
  },
  {
    name: 'handle config of absolute local path',
    content: {
      extends: '/path/to/config',
    },
    expected: ['tslint'],
  },
  {
    name: 'handle config of relative local path',
    content: {
      extends: './config',
    },
    expected: ['tslint'],
  },
  {
    name: 'handle config of module',
    content: {
      extends: 'some-module',
    },
    expected: ['tslint', 'some-module'],
  },
  {
    name: 'handle config of multiple modules',
    content: {
      extends: ['some-module', '@another/module'],
    },
    expected: ['tslint', 'some-module', '@another/module'],
  },
  {
    name: 'handle tslint-plugin-prettier',
    content: {
      rulesDirectory: ['tslint-plugin-prettier'],
      rules: {
        prettier: true,
      },
    },
    expected: ['tslint', 'tslint-plugin-prettier'],
  },
  {
    name: 'handle deactivated tslint-plugin-prettier',
    content: {
      rulesDirectory: ['tslint-plugin-prettier'],
      rules: {
        prettier: false,
      },
    },
    expected: ['tslint'],
  },
];

function testTslint(deps, content) {
  [
    '/path/to/tslint.json',
    '/path/to/tslint.yml',
    '/path/to/tslint.yaml',
  ].forEach((pathToTslintrc) => {
    const result = tslintSpecialParser(
      content,
      pathToTslintrc,
      deps,
      __dirname,
    );

    result.should.deepEqual(deps);
  });
}

describe('tslint special parser', () => {
  it('should ignore when filename is not `tslint.json`', () => {
    const result = tslintSpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should handle parse error', () =>
    testTslint([], '{ this is an invalid JSON string'));

  it('should handle non-standard JSON content', () =>
    testTslint(
      testCases[1].expected,
      `${JSON.stringify(testCases[1].content)}\n// this is ignored`,
    ));

  describe('with custom config', () => {
    it('should parse custom configs from scripts', () => {
      const rootDir = path.resolve(__dirname, '../fake_modules/tslint_config');
      const packagePath = path.resolve(rootDir, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const dependencies = Object.keys(
        JSON.parse(packageContent).devDependencies,
      );
      const result = tslintSpecialParser(
        packageContent,
        packagePath,
        dependencies,
        rootDir,
      );
      result.should.deepEqual(['tslint', 'foo-bar']);
    });

    it('should skip invalid custom configs from scripts', () => {
      const rootDir = path.resolve(
        __dirname,
        '../fake_modules/tslint_config_custom_invalid',
      );
      const packagePath = path.resolve(rootDir, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const dependencies = Object.keys(
        JSON.parse(packageContent).devDependencies,
      );
      const result = tslintSpecialParser(
        packageContent,
        packagePath,
        dependencies,
        rootDir,
      );
      result.should.deepEqual([]);
    });
  });

  describe('with JSON format', () =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () =>
        testTslint(testCase.expected, JSON.stringify(testCase.content))),
    ));

  describe('with YAML format', () =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () =>
        testTslint(testCase.expected, yaml.safeDump(testCase.content))),
    ));
});

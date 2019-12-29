import 'should';
import yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import eslintSpecialParser from '../../src/special/eslint';

const testCases = [
  {
    name: 'ignore when user not extends any config in `.eslintrc`',
    content: {},
    expected: [],
  },
  {
    name: 'detect specific parser',
    content: {
      parser: 'babel-eslint',
    },
    expected: ['babel-eslint'],
  },
  {
    name: 'detect specific plugins',
    content: {
      plugins: [
        'mocha',
        '@foo',
        '@bar/eslint-plugin',
        'baz',
        'eslint-plugin-boo',
        '@foo/bar',
        '@baz\\eslint-plugin',
      ],
    },
    expected: [
      'eslint-plugin-mocha',
      '@foo/eslint-plugin',
      '@bar/eslint-plugin',
      'eslint-plugin-baz',
      'eslint-plugin-boo',
      '@foo/eslint-plugin-bar',
      '@baz/eslint-plugin',
    ],
  },
  {
    name: 'handle eslint config with short name',
    content: {
      extends: 'preset',
    },
    expected: ['eslint-config-preset'],
  },
  {
    name: 'handle prettier',
    content: {
      extends: 'plugin:prettier/recommended',
    },
    expected: ['eslint-plugin-prettier', 'eslint-config-prettier'],
  },
  {
    name: 'handle eslint config with full name',
    content: {
      extends: 'eslint-config-preset',
    },
    expected: ['eslint-config-preset'],
  },
  {
    name: 'handle eslint config from package module',
    content: {
      extends: 'airbnb/base',
    },
    expected: ['eslint-config-airbnb'],
  },
  {
    name: 'handle eslint config with undeclared plugins',
    content: {
      extends: 'airbnb/react',
    },
    expected: ['eslint-config-airbnb', 'eslint-plugin-react'],
  },
  {
    name: 'handle eslint config with nested extends',
    content: {
      extends: 'airbnb',
    },
    expected: ['eslint-config-airbnb', 'eslint-plugin-react'],
  },
  {
    name: 'skip eslint recommended config',
    content: {
      extends: 'eslint:recommended',
    },
    expected: [],
  },
  {
    name: 'skip eslint all config',
    content: {
      extends: 'eslint:all',
    },
    expected: [],
  },
  {
    name: 'handle config of absolute local path',
    content: {
      extends: '/path/to/config',
    },
    expected: [],
  },
  {
    name: 'handle config of relative local path',
    content: {
      extends: './config',
    },
    expected: [],
  },
  {
    name: 'handle config of scoped module',
    content: {
      extends: '@my-org/short-customized',
    },
    expected: ['@my-org/eslint-config-short-customized'],
  },
  {
    name: 'handle config of scoped module with full name',
    content: {
      extends: '@my-org/eslint-config-long-customized',
    },
    expected: ['@my-org/eslint-config-long-customized'],
  },
  {
    name: 'handle config from plugin with short name',
    content: {
      extends: 'plugin:node/recommended',
    },
    expected: ['eslint-plugin-node'],
  },
  {
    name: 'handle config from plugin with full name',
    content: {
      extends: 'plugin:eslint-plugin-node/recommended',
    },
    expected: ['eslint-plugin-node'],
  },
  {
    name: 'handle config from scoped plugin with short name',
    content: {
      extends: 'plugin:@my-org/recommended',
    },
    expected: ['@my-org/eslint-plugin'],
  },
  {
    name: 'handle config from scoped plugin with short name & config',
    content: {
      extends: 'plugin:@my-org/short-customized/recommended',
    },
    expected: ['@my-org/eslint-plugin-short-customized'],
  },
  {
    name: 'handle config from scoped plugin with full name',
    content: {
      extends: 'plugin:@my-org/eslint-plugin-long-customized/recommended',
    },
    expected: ['@my-org/eslint-plugin-long-customized'],
  },
];

function testEslint(deps, content) {
  [
    '/path/to/.eslintrc',
    '/path/to/.eslintrc.js',
    '/path/to/.eslintrc.json',
    '/path/to/.eslintrc.yml',
    '/path/to/.eslintrc.yaml',
  ].forEach((pathToEslintrc) => {
    const result = eslintSpecialParser(
      content,
      pathToEslintrc,
      deps,
      __dirname,
    );

    result.should.deepEqual(deps);
  });
}

describe('eslint special parser', () => {
  it('should ignore when filename is not `.eslintrc`', () => {
    const result = eslintSpecialParser('content', '/a/file', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should handle parse error', () =>
    testEslint([], '{ this is an invalid JSON string', [], __dirname));

  it('should handle non-standard JSON content', () =>
    testEslint(
      testCases[1].expected,
      `${JSON.stringify(testCases[1].content)}\n// this is ignored`,
    ));

  describe('with custom config', () => {
    it('should parse custom configs from scripts', () => {
      const rootDir = path.resolve(
        __dirname,
        '../fake_modules/eslint_config_custom',
      );
      const packagePath = path.resolve(rootDir, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const dependencies = Object.keys(
        JSON.parse(packageContent).devDependencies,
      );
      const result = eslintSpecialParser(
        packageContent,
        packagePath,
        dependencies,
        rootDir,
      );
      result.should.deepEqual([
        'eslint-config-foo-bar',
        'eslint-plugin-not-included',
        'eslint-config-preset',
      ]);
    });

    it('should parse custom js configs from scripts', () => {
      const rootDir = path.resolve(
        __dirname,
        '../fake_modules/eslint_config_js',
      );
      const packagePath = path.resolve(rootDir, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const dependencies = Object.keys(
        JSON.parse(packageContent).devDependencies,
      );
      const result = eslintSpecialParser(
        packageContent,
        packagePath,
        dependencies,
        rootDir,
      );
      result.should.deepEqual([
        'eslint-config-foo-bar',
        'eslint-plugin-not-included',
        'eslint-config-preset',
      ]);
    });
  });

  describe('with JSON format', () =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () =>
        testEslint(testCase.expected, JSON.stringify(testCase.content))),
    ));

  describe('with package.json config', () =>
    testCases.forEach((testCase) => {
      it(`should ${testCase.name}`, () => {
        const packageResult = eslintSpecialParser(
          JSON.stringify({ eslintConfig: testCase.content }),
          path.resolve(__dirname, 'package.json'),
          testCase.expected,
          __dirname,
        );

        packageResult.should.deepEqual(testCase.expected);
      });
    }));

  describe('with YAML format', () =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () =>
        testEslint(testCase.expected, yaml.safeDump(testCase.content))),
    ));
});

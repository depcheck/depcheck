import 'should';
import parser from '../../src/special/jest';
import { getTestParserWithTempFile } from '../utils';

// NOTE: we can't use getTestParserWithContentPromise here
// because the parser is using require
const testParser = getTestParserWithTempFile(parser);

const configFileNames = [
  'jest.config.js',
  'jest.conf.js',
  'jest.config.json',
  'jest.conf.json',
  'jest.it.config.js',
];

const testCases = [
  {
    name: 'ignore when the config is the empty object',
    deps: [],
    content: {},
  },
  {
    name: 'recognize single short-name jest-runner',
    deps: ['jest-runner-mocha'],
    content: { runner: 'mocha' },
  },
  {
    name: 'recognize single long-name jest-runner',
    deps: ['jest-runner-mocha'],
    content: { runner: 'jest-runner-mocha' },
  },
  {
    name: 'recognize single short-name jest-watch plugin',
    deps: ['jest-watch-master'],
    content: { watchPlugins: ['master'] },
  },
  {
    name: 'recognize single long-name jest-watch plugin',
    deps: ['jest-watch-master'],
    content: { watchPlugins: ['jest-watch-master'] },
  },
  {
    name: 'recognize multiple short-name jest-watch plugin',
    deps: ['jest-watch-master', 'jest-watch-select-projects'],
    content: { watchPlugins: ['master', 'select-projects'] },
  },
  {
    name: 'recognize module with options',
    deps: ['jest-watch-master'],
    content: {
      watchPlugins: [
        [
          'master',
          {
            key: 'k',
            prompt: 'show a custom prompt',
          },
        ],
      ],
    },
  },
  {
    name: 'recognize transform path with node_modules',
    deps: ['babel-jest'],
    content: {
      transform: {
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
      },
    },
  },
  {
    name: 'recognize duplicated transformer',
    deps: ['babel-jest'],
    content: {
      transform: {
        '^.+\\.js?$': 'babel-jest',
        '^.+\\.jsx?$': 'babel-jest',
      },
    },
  },
  {
    name: 'recognize module when preset is referenced',
    deps: ['foo-bar'],
    content: {
      preset: './node_modules/foo-bar/jest-preset.js',
    },
  },
  {
    name: 'recognize reporter when defined with options',
    deps: ['jest-custom-reporter', 'jest-reporter'],
    content: {
      reporters: [
        ['jest-custom-reporter', { foo: 'bar' }],
        ['<rootDir>/node_modules/jest-reporter', { jest: 'reporter' }],
      ],
    },
  },
  {
    name: 'recognize array of strings of modules',
    deps: ['foo', 'bar', 'jest', 'babel-jest'],
    content: {
      setupFiles: [
        '<rootDir>/node_modules/foo',
        '../node_modules/bar',
        'jest',
        './node_modules/babel-jest/custom-setup.js',
      ],
    },
  },
  {
    name: 'recognize multiple options',
    deps: ['babel-jest', 'vue-jest', 'jest-serializer-vue'],
    content: {
      transform: {
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.vue$': 'vue-jest',
      },
      snapshotSerializers: ['jest-serializer-vue'],
    },
  },
];

async function testJest(content, deps, expectedDeps, _filename) {
  const filename = _filename || configFileNames[0];
  const result = await testParser(content, filename, deps, __dirname);
  Array.from(result)
    .sort()
    .should.deepEqual(expectedDeps.sort());
}

describe('jest special parser', () => {
  it('should ignore when filename is not supported', async () => {
    const result = await parser('jest.js', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should handle JSON parse error', () => {
    const content = '{ this is an invalid JSON string';
    return testJest(content, [], []);
  });

  it('should handle parse error for valid JS but invalid JSON', () => {
    const content = 'module.exports = function() {}';
    return testJest(content, [], []);
  });

  it('should ignore unsupported config properties', () => {
    const content = `module.exports = ${{ unsupported: 'npm-module' }}`;
    return testJest(content, [], []);
  });

  it('should recognize unused dependencies in jest config', () => {
    const config = JSON.stringify(testCases[1].content);
    const content = `module.exports = ${config}`;
    const deps = testCases[1].deps.concat(['unused-module']);
    return testJest(content, deps, testCases[1].deps);
  });

  it('should handle require call to other modules', () => {
    const config = JSON.stringify(testCases[1].content);
    const content = `const fs = require('fs');
      module.exports = ${config}`;
    return testJest(content, testCases[1].deps, testCases[1].deps);
  });

  it('should handle options which are not supported', async () => {
    const content = 'module.exports = { automock: true }';
    const result = await testParser(content, 'jest.config.js', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should handle JSON parse error when using package.json', async () => {
    const content = '{ this is an invalid JSON string';
    const result = await testParser(content, 'package.json', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should handle package.json config', async () => {
    const content = JSON.stringify({ jest: [...testCases].pop().content });
    const result = await testParser(
      content,
      'package.json',
      [...testCases].pop().deps,
      __dirname,
    );
    result.sort().should.deepEqual([...testCases].pop().deps.sort());
  });

  it('should handle if module.exports evaluates to undefined', async () => {
    const content = 'module.exports = undefined';
    return testJest(content, [], []);
  });

  configFileNames.forEach((fileName) =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name} in config file ${fileName}`, async () => {
        const config = JSON.stringify(testCase.content);
        let content = config;
        if (fileName.split('.').pop() === 'js') {
          content = `module.exports = ${config}`;
        }
        return testJest(content, testCase.deps, testCase.deps, fileName);
      }),
    ),
  );
});

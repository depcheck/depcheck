import 'should';
import parser from '../../src/special/babel';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

const testCases = [
  {
    name: 'handle no options case',
    deps: [],
    options: undefined,
  },
  {
    name: 'recognize the short-name plugin',
    deps: ['babel-plugin-syntax-jsx'],
    options: {
      plugins: ['syntax-jsx'],
    },
  },
  {
    name: 'recognize the long-name plugin',
    deps: ['babel-plugin-syntax-jsx'],
    options: {
      plugins: ['babel-plugin-syntax-jsx'],
    },
  },
  {
    name: 'recognize the short-name preset',
    deps: ['babel-preset-es2015'],
    options: {
      presets: ['es2015'],
    },
  },
  {
    name: 'recognize the long-name preset',
    deps: ['babel-preset-es2015'],
    options: {
      presets: ['babel-preset-es2015'],
    },
  },
  {
    name: 'recognize the scoped short-name plugin',
    deps: ['@babel/plugin-syntax-jsx'],
    options: {
      plugins: ['@babel/syntax-jsx'],
    },
  },
  {
    name: 'recognize the scoped long-name plugin',
    deps: ['@babel/plugin-syntax-jsx'],
    options: {
      plugins: ['@babel/plugin-syntax-jsx'],
    },
  },
  {
    name: 'recognize the scoped short-name preset',
    deps: ['@babel/preset-es2015'],
    options: {
      presets: ['@babel/es2015'],
    },
  },
  {
    name: 'recognize the scoped long-name preset',
    deps: ['@babel/preset-es2015'],
    options: {
      presets: ['@babel/preset-es2015'],
    },
  },
  {
    name: 'recognize plugin specified with options',
    deps: ['babel-plugin-transform-async-to-module-method'],
    options: {
      plugins: [
        [
          'transform-async-to-module-method',
          {
            module: 'bluebird',
            method: 'coroutine',
          },
        ],
      ],
    },
  },
  {
    name: 'recognize tranforms used in babel-plugin-react-transform',
    deps: [
      'babel-plugin-react-transform',
      'react-transform-hmr',
      'react-transform-catch-errors',
    ],
    options: {
      plugins: [
        [
          'react-transform',
          {
            transforms: [
              {
                transform: 'react-transform-hmr',
                imports: ['react'],
                locals: ['module'],
              },
              {
                transform: 'react-transform-catch-errors',
                imports: ['react', 'redbox-react'],
              },
              {
                transform: './my-custom-transform',
              },
            ],
          },
        ],
      ],
    },
  },
];

async function testBabel(filename, deps, content) {
  const result = await testParser(
    content ? JSON.stringify(content) : '',
    filename,
    deps,
  );
  result.should.deepEqual(deps);
}

describe('babel special parser', () => {
  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt', ['deps']);
    result.should.deepEqual([]);
  });

  it('should recognize dependencies not a babel plugin', async () => {
    const content = JSON.stringify({
      presets: ['es2015'],
    });

    const result = await testParser(content, '/path/to/.babelrc', [
      'babel-preset-es2015',
      'dep',
    ]);
    result.should.deepEqual(['babel-preset-es2015']);
  });

  it('should detect babel.config.js', async () => {
    const content = "module.exports = { presets: ['es2015' ] }";

    const result = await testParser(content, '/path/to/babel.config.js', [
      'babel-preset-es2015',
      'dep',
    ]);
    result.should.deepEqual(['babel-preset-es2015']);
  });

  testCases.forEach((testCase) =>
    it(`should ${testCase.name} in .babelrc file`, () =>
      testBabel('.babelrc', testCase.deps, testCase.options)),
  );

  testCases.forEach((testCase) =>
    it(`should ${testCase.name} inside .babelrc file env section`, () =>
      testBabel('.babelrc', testCase.deps, {
        env: {
          production: testCase.options,
        },
      })),
  );

  testCases.forEach((testCase) =>
    it(`should ${testCase.name} in package.json file`, () =>
      testBabel('package.json', testCase.deps, {
        name: 'my-package',
        version: '1.0.0',
        babel: testCase.options,
      })),
  );

  testCases.forEach((testCase) =>
    it(`should ${testCase.name} inside package.json file env section`, () =>
      testBabel('package.json', testCase.deps, {
        name: 'my-package',
        version: '1.0.0',
        babel: {
          env: {
            development: testCase.options,
          },
        },
      })),
  );
});

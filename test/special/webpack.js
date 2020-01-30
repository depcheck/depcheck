import 'should';
import path from 'path';
import fs from 'fs';
import parser from '../../src/special/webpack';
import { tryRequire } from '../../src/utils';
import { getTestParserWithTempFile } from '../utils';

// NOTE: we can't use getTestParserWithContentPromise here
// because the parser is using tryRequire
const testParser = getTestParserWithTempFile(parser);

const configFileNames = [
  'webpack.config.js',
  'webpack.development.config.js',
  'webpack.production.config.js',
  'webpack.config.babel.js',
  'webpack.prod.config.babel.js',
  'webpack.prod.conf.js',
  'webpack.base.conf.babel.js',
  'webpack.config.ts',
  'webpack.base.conf.babel.ts',
];

const testCases = [
  {
    name: 'recognize single long-name webpack loader',
    deps: ['jade-loader'],
    module: {
      loaders: [{ test: /\.jade$/, loader: 'jade-loader' }],
    },
  },
  {
    name: 'recognize single short-name webpack loader',
    deps: ['jade-loader'],
    module: {
      loaders: [{ test: /\.jade$/, loader: 'jade' }],
    },
  },
  {
    name: 'recognize duplicated loader names',
    deps: ['jsx-loader'],
    module: {
      loaders: [
        { test: /\.js$/, loader: 'jsx' },
        { test: /\.jsx$/, loader: 'jsx' },
      ],
    },
  },
  {
    name: 'recognize multiple webpack loaders concatenated with exclamation',
    deps: ['style-loader', 'css-loader'],
    module: {
      loaders: [{ test: /\.css$/, loader: 'style!css' }],
    },
  },
  {
    name: 'recognize multiple webpack loaders within loaders property',
    deps: ['style-loader', 'css-loader'],
    module: {
      loaders: [{ test: /\.css$/, loaders: ['style', 'css'] }],
    },
  },
  {
    name: 'recognize webpack loader with query parameters',
    deps: ['url-loader'],
    module: {
      loaders: [{ test: /\.png$/, loader: 'url-loader?mimetype=image/png' }],
    },
  },
  {
    name: 'recognize webpack loaders in preLoaders and postLoaders properties',
    deps: ['pre-webpack-loader', 'post-webpack-loader'],
    module: {
      preLoaders: [{ test: /\.pre$/, loader: 'pre' }],
      postLoaders: [{ test: /\.post$/, loader: 'post' }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.loaders (string array)',
    deps: ['style-loader', 'css-loader'],
    module: {
      rules: [{ test: /\.css$/, loaders: ['style-loader', 'css-loader'] }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.loaders (object array)',
    deps: ['style-loader', 'css-loader'],
    module: {
      rules: [
        {
          test: /\.css$/,
          loaders: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
        },
      ],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.loader',
    deps: ['style-loader'],
    module: {
      rules: [{ test: /\.css$/, loader: 'style-loader' }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.loader (string array)',
    deps: ['style-loader'],
    module: {
      rules: [{ test: /\.css$/, loader: ['style-loader'] }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.use',
    deps: ['style-loader'],
    module: {
      rules: [{ test: /\.css$/, use: 'style-loader' }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.use (string array)',
    deps: ['style-loader', 'css-loader'],
    module: {
      rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.use (object)',
    deps: ['style-loader'],
    module: {
      rules: [{ test: /\.css$/, use: { loader: 'style-loader' } }],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.use (object array)',
    deps: ['style-loader', 'css-loader'],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
        },
      ],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.use (mixed array)',
    deps: ['style-loader', 'css-loader'],
    module: {
      rules: [
        { test: /\.css$/, use: [{ loader: 'style-loader' }, 'css-loader'] },
      ],
    },
  },
  {
    name: 'recognize webpack v2 loaders in module.rules.loader (object array)',
    deps: ['style-loader'],
    module: {
      rules: [{ test: /\.css$/, loader: [{ loader: 'style-loader' }] }],
    },
  },
  {
    name: 'handle invalid/unrecognised webpack v2 loaders',
    deps: [],
    module: {
      rules: [{ test: /\.css$/, loader: [{ loader: null }, 1] }],
    },
  },
  {
    name: 'recognize dependency in simple entry',
    deps: ['polyfill'],
    entry: 'polyfill',
  },
  {
    name: 'recognize dependency in array-type entry',
    deps: ['polyfill', 'font'],
    entry: ['polyfill', 'font', './src/app'],
  },
  {
    name: 'recognize dependency in object-type simple entry',
    deps: ['polyfill'],
    entry: {
      polyfill: 'polyfill',
      app: './src/app',
    },
  },
  {
    name: 'recognize dependency in object-type array entry',
    deps: ['polyfill', 'font'],
    entry: {
      polyfill: ['polyfill', 'font'],
      app: './src/app',
    },
  },
  {
    name: 'recognize dependency in babel loader presets',
    deps: ['babel-loader', '@babel/preset1', '@babel/preset2'],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset1', { option: 'option' }],
                '@babel/preset2',
              ],
            },
          },
        },
      ],
    },
  },
  {
    name: 'handle invalid webpack config',
    deps: [],
    nomodule: true,
  },
];

async function testWebpack(filename, content, deps, expectedDeps) {
  const result = await testParser(content, filename, deps, __dirname);
  Array.from(result).should.deepEqual(expectedDeps);
}

function registerTs(rootDir) {
  const ts = tryRequire('typescript', [rootDir, process.cwd(), __dirname]);
  if (ts) {
    require.extensions['.ts'] = (module, filename) => {
      const content = fs.readFileSync(filename, 'utf8');
      const options = tryRequire(path.join(rootDir, 'package.json')) || {};
      options.fileName = filename;
      const transpiled = ts.transpileModule(
        content.charCodeAt(0) === 0xfeff ? content.slice(1) : content,
        options,
      );
      // eslint-disable-next-line no-underscore-dangle
      module._compile(transpiled.outputText, filename);
    };
  }
}

describe('webpack special parser', () => {
  registerTs('.');

  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt', []);
    result.should.deepEqual([]);
  });

  it('should recognize unused dependencies in webpack configuration', () => {
    const config = JSON.stringify({ module: testCases[0].module });
    const content = `module.exports = ${config}`;
    const deps = testCases[0].deps.concat(['unused-loader']);
    return testWebpack('webpack.config.js', content, deps, testCases[0].deps);
  });

  it('should handle require call to other modules', () => {
    const config = JSON.stringify({ module: testCases[0].module });
    const content = `module.exports = ${config}\nrequire('webpack')`;
    return testWebpack(
      'webpack.config.js',
      content,
      testCases[0].deps,
      testCases[0].deps,
    );
  });

  configFileNames.forEach((fileName) =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name} in configuration file ${fileName}`, () => {
        const config = JSON.stringify({
          entry: testCase.entry,
          module: testCase.module,
        });
        const content = fileName.endsWith('.ts')
          ? `const config: any = ${config}\nmodule.exports = config`
          : `module.exports = ${config}`;

        return testWebpack(fileName, content, testCase.deps, testCase.deps);
      }),
    ),
  );

  it('should handle styleguidist webpack configuration', () => {
    const expectedDeps = [
      'babel-loader',
      'url-loader',
      'style-loader',
      'css-loader',
    ];

    const packagePath = path.resolve(
      __dirname,
      '../fake_modules/styleguidist_config/package.json',
    );
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const deps = Object.keys(JSON.parse(packageContent).devDependencies);

    const filename = path.resolve(
      __dirname,
      '../fake_modules/styleguidist_config/styleguide.config.js',
    );
    const content = fs.readFileSync(filename, 'utf8');

    return testWebpack('styleguide.config.js', content, deps, expectedDeps);
  });

  it('should handle next.js configuration', () => {
    const expectedDeps = [
      'html-loader',
      'raw-loader',
      'file-loader',
      'markdown-loader',
      'url-loader',
    ];

    const packagePath = path.resolve(
      __dirname,
      '../fake_modules/next_config/package.json',
    );
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const deps = Object.keys(JSON.parse(packageContent).devDependencies);

    const filename = path.resolve(
      __dirname,
      '../fake_modules/next_config/next.config.js',
    );
    const content = fs.readFileSync(filename, 'utf8');

    return testWebpack('next.config.js', content, deps, expectedDeps);
  });

  it('should handle next.js invalid configuration', () => {
    const expectedDeps = [];

    const packagePath = path.resolve(
      __dirname,
      '../fake_modules/next_config_invalid/package.json',
    );
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const deps = Object.keys(JSON.parse(packageContent).devDependencies);

    const filename = path.resolve(
      __dirname,
      '../fake_modules/next_config_invalid/next.config.js',
    );
    const content = fs.readFileSync(filename, 'utf8');

    return testWebpack('next.config.js', content, deps, expectedDeps);
  });
});

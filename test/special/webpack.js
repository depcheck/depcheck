import 'should';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import parse from '../../src/special/webpack';
import { tryRequire } from '../../src/utils';

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

function random() {
  return Math.random()
    .toString()
    .substring(2);
}

async function getTempPath(filename, content) {
  const tempFolder = path.resolve(__dirname, `temp-${random()}`);
  const tempPath = path.resolve(tempFolder, filename);
  await fse.ensureDir(tempFolder);
  await fse.outputFile(tempPath, content);
  return tempPath;
}

async function removeTempFile(filepath) {
  const fileFolder = path.dirname(filepath);
  await fse.remove(filepath);
  await fse.remove(fileFolder);
}

async function testWebpack(filename, content, deps, expectedDeps) {
  const tempPath = await getTempPath(filename, content);
  const result = parse('content', tempPath, deps);
  await removeTempFile(tempPath);
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

  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', []);
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
});

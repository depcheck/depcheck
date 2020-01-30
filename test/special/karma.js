import path from 'path';
import proxyquire from 'proxyquire';
import 'should';
import { getTestParserWithContentPromise } from '../utils';

const proxyquireStrict = proxyquire.noCallThru();

const karmaPlugins = {
  'karma-qunit': {
    fileName: 'node_modules/karma-qunit/index.js',
    src: {
      'framework:qunit': [],
    },
  },
  'karma-sinon': {
    fileName: 'node_modules/karma-sinon/index.js',
    src: {
      'framework:sinon': [],
    },
  },
  'karma-junit-reporter': {
    fileName: 'node_modules/karma-junit-reporter/index.js',
    src: {
      'reporter:junit': [],
    },
  },
  'karma-phantomjs-launcher': {
    fileName: 'node_modules/karma-phantomjs-launcher/index.js',
    src: {
      'launcher:PhantomJS': [],
    },
  },
  'karma-chrome-launcher': {
    fileName: 'node_modules/karma-chrome-launcher/index.js',
    src: {
      'launcher:Chrome': [],
      'launcher:ChromeHeadless': [],
    },
  },
  'karma-coverage': {
    fileName: 'node_modules/karma-coverage/index.js',
    src: {
      'preprocessor:coverage': [],
      'reporter:coverage': [],
    },
  },
  'strange-plugin': {
    fileName: 'node_modules/strange-plugin/index.js',
    src: {
      'framework:strange': [],
    },
  },
};

const sourceMap = {};

Object.keys(karmaPlugins)
  .map((k) => karmaPlugins[k])
  .forEach((plugin) => {
    sourceMap[plugin.fileName] = plugin.src;
  });

const parser = proxyquireStrict('../../src/special/karma', {
  resolve: {
    sync(module) {
      const plugin = karmaPlugins[module];
      if (plugin) {
        return plugin.fileName;
      }
      return null;
    },
  },
  fs: {
    readFileSync(filePath) {
      const src = sourceMap[filePath];
      if (src) {
        return `module.exports = ${JSON.stringify(src)}`;
      }
      return null;
    },
  },
});

const testParser = getTestParserWithContentPromise(parser);

describe('karma special parser', () => {
  const configPath = path.resolve('/a', '/a/karma.conf.js');

  it('should ignore when filename is not a karma config file', async () => {
    const filename = path.resolve('/a', '/a/file');
    const result = await parser(filename, ['somePlugin'], '/a');
    result.should.deepEqual([]);
  });

  it('should translate frameworks to plugins', async () => {
    // frameworks: ['qunit', 'sinon'] --> ['karma-qunit', 'karma-sinon']
    const result = await testParser(
      'module.exports = function(config) {' +
        '  config.set({' +
        '    frameworks: ["qunit", "sinon"]' +
        '  });' +
        '};',
      configPath,
      ['karma-qunit', 'karma-sinon', 'another-dep'],
      '/a',
    );
    result.should.deepEqual(['karma-qunit', 'karma-sinon']);
  });

  it('should translate reporters', async () => {
    // reporters: ['junit'] --> ['karma-junit-reporter']
    const result = await testParser(
      'module.exports = function(config) {' +
        '  config.set({' +
        '    reporters: ["coverage", "junit"]' +
        '  });' +
        '};',
      configPath,
      ['karma-coverage', 'karma-junit-reporter', 'another-dep'],
      '/a',
    );
    result.should.deepEqual(['karma-coverage', 'karma-junit-reporter']);
  });

  it('should translate browsers into launchers', async () => {
    // browsers: ['PhantomJS','Chrome','ChromeHeadless']
    // --> ['karma-phantomjs-launcher', 'karma-chrome-launcher']
    const result = await testParser(
      'module.exports = function(config) {' +
        '  config.set({' +
        '    browsers: ["PhantomJS", "Chrome", "ChromeHeadless"]' +
        '  });' +
        '};',
      configPath,
      ['karma-phantomjs-launcher', 'karma-chrome-launcher', 'another-dep'],
      '/a',
    );
    result.should.deepEqual([
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
    ]);
  });

  it('should translate preprocessors into plugins', async () => {
    // preprocessors: { 'src/**/*.js': 'coverage' } --> ['karma-coverage']
    const result = await testParser(
      'module.exports = function(config) {' +
        '  config.set({' +
        '    preprocessors: {"src/**/*.js": "coverage"}' +
        '  });' +
        '};',
      configPath,
      ['karma-coverage', 'another-dep'],
      '/a',
    );
    result.should.deepEqual(['karma-coverage']);
  });

  it('should load explict plugins', async () => {
    // plugins: ['strange-plugin'], frameworks: ['strange'] --> ['strange-plugin']
    const result = await testParser(
      'module.exports = function(config) {' +
        '  config.set({' +
        '    frameworks: ["strange"],' +
        '    plugins: ["strange-plugin"]' +
        '  });' +
        '};',
      configPath,
      ['strange-plugin', 'another-dep'],
      '/a',
    );
    result.should.deepEqual(['strange-plugin']);
  });
});

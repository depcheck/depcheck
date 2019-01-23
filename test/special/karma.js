/* global describe, it */

import path from 'path';
import proxyquire from 'proxyquire';
import 'should';

const proxyquireStrict = proxyquire.noCallThru();
const karmaSpecialParser = proxyquireStrict('../../src/special/karma', {
  'karma-qunit': {
    'framework:qunit': [],
    '@global': true,
  },
  'karma-sinon': {
    'framework:sinon': [],
    '@global': true,
  },
  'karma-junit-reporter': {
    'reporter:junit': [],
    '@global': true,
  },
  'karma-phantomjs-launcher': {
    'launcher:PhantomJS': [],
    '@global': true,
  },
  'karma-chrome-launcher': {
    'launcher:Chrome': [],
    'launcher:ChromeHeadless': [],
    '@global': true,
  },
  'karma-coverage': {
    'preprocessor:coverage': [],
    'reporter:coverage': [],
    '@global': true,
  },
});

describe('karma special parser', () => {
  const configPath = path.resolve('/a', '/a/karma.conf.js');
  it('should ignore when filename is not a karma config file', () => {
    const result = karmaSpecialParser('content', path.resolve('/a', '/a/file'), ['somePlugin'], '/a');
    result.should.deepEqual([]);
  });

  it('should translate frameworks to plugins', () => {
    // frameworks: ['qunit', 'sinon'] --> ['karma-qunit', 'karma-sinon']
    const result = karmaSpecialParser(
      'module.exports = function(config) {'
      + '  config.set({'
      + '    frameworks: ["qunit", "sinon"]'
      + '  });'
      + '};', configPath, ['karma-qunit', 'karma-sinon', 'another-dep'], '/a',
    );
    result.should.deepEqual(['karma-qunit', 'karma-sinon']);
  });

  it('should translate reporters', () => {
    // reporters: ['junit'] --> ['karma-junit-reporter']

    const result = karmaSpecialParser('module.exports = function(config) {'
      + '  config.set({'
      + '    reporters: ["coverage", "junit"]'
      + '  });'
      + '};', configPath, ['karma-coverage', 'karma-junit-reporter', 'another-dep'], '/a');
    result.should.deepEqual(['karma-coverage', 'karma-junit-reporter']);
  });

  it('should translate browsers into launchers', () => {
    // browsers: ['PhantomJS','Chrome','ChromeHeadless']
    // --> ['karma-phantomjs-launcher', 'karma-chrome-launcher']
    const result = karmaSpecialParser('module.exports = function(config) {'
      + '  config.set({'
      + '    browsers: ["PhantomJS", "Chrome", "ChromeHeadless"]'
      + '  });'
      + '};', configPath, ['karma-phantomjs-launcher', 'karma-chrome-launcher', 'another-dep'], '/a');
    result.should.deepEqual(['karma-phantomjs-launcher', 'karma-chrome-launcher']);
  });

  it('should translate preprocessors into plugins', () => {
    // preprocessors: { 'src/**/*.js': 'coverage' } --> ['karma-coverage']
    const result = karmaSpecialParser('module.exports = function(config) {'
      + '  config.set({'
      + '    preprocessors: {"src/**/*.js": "coverage"}'
      + '  });'
      + '};', configPath, ['karma-coverage', 'another-dep'], '/a');
    result.should.deepEqual(['karma-coverage']);
  });
});

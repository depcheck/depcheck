/* global describe, it */

import 'should';
import path from 'path';
import binSpecialParser from '../../src/special/bin';

describe('bin special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = binSpecialParser('content', 'not-supported.txt', [], '/root/dir');
    result.should.deepEqual([]);
  });

  function testBinSpecialParser(filename, serializer) {
    function testScript(script, dependencies) {
      const content = serializer(script);
      const deps = dependencies || ['binary-package'];
      const result = binSpecialParser(content, filename, deps, __dirname);
      return result;
    }

    it('should detect packages used in scripts', () =>
      testScript('binary-entry --argument').should.deepEqual(['binary-package']));

    it('should detect packages used as `.bin` path', () =>
      testScript('./node_modules/.bin/binary-entry').should.deepEqual(['binary-package']));

    it('should detect packages used as package path', () =>
      testScript('./node_modules/binary-package/bin/binary-exe').should.deepEqual(['binary-package']));

    it('should not report it when it is not used', () =>
      testScript('other-bin').should.deepEqual([]));

    it('should ignore detection when no scripts section', () =>
      testScript(false).should.deepEqual([]));

    it('should ignore the dependencies without bin entry', () =>
      testScript('no-binary', ['eslint-config-standard']).should.deepEqual([]));
  }

  describe('on `package.json`', () => {
    testBinSpecialParser(
      '/path/to/package.json',
      script => JSON.stringify(script ? { scripts: { t: script } } : {}));
  });

  describe('on `.travis.yml`', () => {
    testBinSpecialParser(
      '/path/to/.travis.yml',
      script => script ? `script:\n  - ${script}` : '');
  });
});

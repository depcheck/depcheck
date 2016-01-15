/* global describe, it */

import 'should';
import path from 'path';
import parse from '../../src/special/mocha';

describe('mocha special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should recognize unused dependencies in default mocha options', () => {
    const content = ['--require chai', '--ui bdd', '--reporter spec'].join('\n');
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse(content, optPath, ['chai', 'unused'], __dirname);
    result.should.deepEqual(['chai']);
  });
});

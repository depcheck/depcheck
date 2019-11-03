/* global describe, it */

import 'should';
import parse from '../../src/special/npm-scirpts';

describe('npm scripts special parser', () => {
  it('should ignore when not a lifecylce event', () => {
    const lifecycle = process.env.npm_lifecycle_event;
    delete process.env.npm_lifecycle_event;
    const result = parse('content', '/path/to/package.json');
    process.env.npm_lifecycle_event = lifecycle;
    result.should.deepEqual([]);
  });

  it('should ignore when not a package.json', () => {
    const lifecycle = process.env.npm_lifecycle_event;
    delete process.env.npm_lifecycle_event;
    const result = parse('content', '/path/to/package.json');
    process.env.npm_lifecycle_event = lifecycle;
    result.should.deepEqual([]);
  });

  it('should detect current npm lifecycle event', () => {
    const expected = ['depcheck'];
    const content = JSON.stringify({});
    process.env.npm_lifecycle_event = 'depcheck';
    const actual = parse(content, '/path/to/package.json');
    actual.should.deepEqual(expected);
  });
});

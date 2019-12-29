import 'should';
import parse from '../../src/special/husky';

describe('husky special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], '/root/dir');
    result.should.deepEqual([]);
  });

  it('should detect husky when used', () => {
    const expected = ['husky'];
    const content = JSON.stringify({
      husky: {
        hooks: {
          'pre-commit': 'yarn tsc && yarn lint-staged',
        },
      },
    });
    const actual = parse(content, '/path/to/package.json');
    actual.should.deepEqual(expected);
  });
});

import 'should';
import parse from '../../src/special/lint-staged';

describe('lint-staged special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], '/root/dir');
    result.should.deepEqual([]);
  });

  it('should detect lint-staged when used', () => {
    const expected = ['lint-staged'];
    const content = JSON.stringify({
      'lint-staged': {
        '*.md': 'markdownlint',
        '*.{js,jsx,ts,tsx}': 'eslint --ext .js,.ts,.tsx',
      },
    });
    const actual = parse(content, '/path/to/package.json');
    actual.should.deepEqual(expected);
  });
});

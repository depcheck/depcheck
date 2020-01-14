import 'should';
import parser from '../../src/special/lint-staged';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

describe('lint-staged special parser', () => {
  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt', [], '/root/dir');
    result.should.deepEqual([]);
  });

  it('should detect lint-staged when used', async () => {
    const expected = ['lint-staged'];
    const content = JSON.stringify({
      'lint-staged': {
        '*.md': 'markdownlint',
        '*.{js,jsx,ts,tsx}': 'eslint --ext .js,.ts,.tsx',
      },
    });
    const actual = await testParser(content, '/path/to/package.json');
    actual.should.deepEqual(expected);
  });
});

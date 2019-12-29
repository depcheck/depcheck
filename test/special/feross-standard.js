import 'should';
import standardSpecialParser from '../../src/special/feross-standard';

describe('feross standard special parser', () => {
  it('should ignore when it is not `package.json`', () => {
    const result = standardSpecialParser(
      'content',
      '/a/file',
      ['standard'],
      '/a',
    );
    result.should.deepEqual([]);
  });

  it('should recognize the parser used by feross standard', () => {
    const metadata = {
      standard: {
        parser: 'babel-eslint',
      },
    };

    const content = JSON.stringify(metadata);
    const result = standardSpecialParser(
      content,
      '/a/package.json',
      ['standard'],
      '/a',
    );
    result.should.deepEqual(['babel-eslint']);
  });
});

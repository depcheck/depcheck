import 'should';
import commitizenSpecialParser from '../../src/special/commitizen';

describe('commitizen special parser', () => {
  it('should ignore when it is not `package.json`', () => {
    const result = commitizenSpecialParser('content', '/a/file', [], '/a');
    result.should.deepEqual([]);
  });

  it('should ignore when path is missing', () => {
    const metadata = {
      config: {
        commitizen: {},
      },
    };

    const content = JSON.stringify(metadata);
    const result = commitizenSpecialParser(
      content,
      '/a/package.json',
      [],
      '/a',
    );
    result.should.deepEqual([]);
  });

  it('should recognize the module used by commitizen (long style)', () => {
    const metadata = {
      config: {
        commitizen: {
          path: './node_modules/cz-test',
        },
      },
    };

    const content = JSON.stringify(metadata);
    const result = commitizenSpecialParser(
      content,
      '/a/package.json',
      [],
      '/a',
    );
    result.should.deepEqual(['cz-test']);
  });

  it('should recognize the module used by commitizen (short style)', () => {
    const metadata = {
      config: {
        commitizen: {
          path: 'cz-test',
        },
      },
    };

    const content = JSON.stringify(metadata);
    const result = commitizenSpecialParser(
      content,
      '/a/package.json',
      [],
      '/a',
    );
    result.should.deepEqual(['cz-test']);
  });
});

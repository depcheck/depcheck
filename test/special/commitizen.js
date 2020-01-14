import 'should';
import parser from '../../src/special/commitizen';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

describe('commitizen special parser', () => {
  it('should ignore when it is not `package.json`', async () => {
    const result = await parser('/a/file', [], '/a');
    result.should.deepEqual([]);
  });

  it('should ignore when path is missing', async () => {
    const metadata = {
      config: {
        commitizen: {},
      },
    };
    const content = JSON.stringify(metadata);
    const result = await testParser(content, '/a/package.json', [], '/a');
    result.should.deepEqual([]);
  });

  it('should recognize the module used by commitizen (long style)', async () => {
    const metadata = {
      config: {
        commitizen: {
          path: './node_modules/cz-test',
        },
      },
    };
    const content = JSON.stringify(metadata);
    const result = await testParser(content, '/a/package.json', [], '/a');
    result.should.deepEqual(['cz-test']);
  });

  it('should recognize the module used by commitizen (short style)', async () => {
    const metadata = {
      config: {
        commitizen: {
          path: 'cz-test',
        },
      },
    };
    const content = JSON.stringify(metadata);
    const result = await testParser(content, '/a/package.json', [], '/a');
    result.should.deepEqual(['cz-test']);
  });
});

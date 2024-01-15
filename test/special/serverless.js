import 'should';
import parser from '../../src/special/serverless';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

describe('serverless special parser', () => {
  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt');
    result.should.deepEqual([]);
  });

  it('should detect serverless when used', async () => {
    const expected = ['serverless', 'serverless-webpack', 'serverless-offline'];
    const content = `
    service:
      name: serverless-test
    plugins:
      - serverless-webpack
      - serverless-offline`;
    const actual = await testParser(content, 'serverless.yml');
    actual.should.deepEqual(expected);
  });
});

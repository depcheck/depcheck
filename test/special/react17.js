import 'should';
import parser from '../../src/special/react17';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

async function testReact17(filename, deps, content) {
  const result = await testParser(
    content ? JSON.stringify(content) : '',
    filename,
    deps,
  );
  result.should.deepEqual(deps);
}

describe('react17 special parser', () => {
  it(`should report react as used if version >= 17.0.0`, () =>
    testReact17('package.json', ['react'], {
      name: 'my-package',
      version: '1.0.0',
      dependencies: {
        react: '^17.0.0',
      },
    }));

  it(`should not report react as used if version < 17.0.0`, () =>
    testReact17('package.json', [], {
      name: 'my-package',
      version: '1.0.0',
      dependencies: {
        react: '^16.0.0',
      },
    }));

  it(`should not report react if the version is invalid`, () =>
    testReact17('package.json', [], {
      name: 'my-package',
      version: '1.0.0',
      dependencies: {
        react: 'latest',
      },
    }));
});

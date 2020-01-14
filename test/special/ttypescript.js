import 'should';
import parser from '../../src/special/ttypescript';
import { getTestParserWithTempFile } from '../utils';

// NOTE: we can't use getTestParserWithContentPromise here
// because the parser is using readJSON which is a require
const testParser = getTestParserWithTempFile(parser);

const configFileNames = ['tsconfig.json', 'tsconfig.bundle.json'];

const testCases = [
  {
    name: 'recognize when no transform name',
    transforms: [],
  },
  {
    name: 'recognize single transform name',
    transforms: ['tts-transform'],
  },
  {
    name: 'recognize multiple transform name',
    transforms: ['tts-transform1', 'tts-transform2'],
  },
];

async function testTTypeScript(filename, content, expectedDeps) {
  const deps = ['dummy', ...expectedDeps];
  const result = await testParser(content, filename, deps, __dirname);
  Array.from(result).should.deepEqual(expectedDeps);
}

describe('ttypescript special parser', () => {
  it('should ignore when filename is not supported', () => {
    const content = JSON.stringify({
      compilerOptions: {
        plugins: [
          {
            transform: 'dummy',
          },
        ],
      },
    });
    return testTTypeScript('not-supported.txt', content, []);
  });

  configFileNames.forEach((fileName) =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name} in configuration file ${fileName}`, () => {
        const content = JSON.stringify({
          compilerOptions: {
            plugins: testCase.transforms.map((transform) => ({ transform })),
          },
        });
        return testTTypeScript(fileName, content, testCase.transforms);
      }),
    ),
  );
});

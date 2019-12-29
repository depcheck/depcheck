import 'should';
import path from 'path';
import fse from 'fs-extra';
import parse from '../../src/special/ttypescript';

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

function random() {
  return Math.random()
    .toString()
    .substring(2);
}

async function getTempPath(filename, content) {
  const tempFolder = path.resolve(__dirname, `temp-${random()}`);
  const tempPath = path.resolve(tempFolder, filename);
  await fse.ensureDir(tempFolder);
  await fse.outputFile(tempPath, content);
  return tempPath;
}

async function removeTempFile(filepath) {
  const fileFolder = path.dirname(filepath);
  await fse.remove(filepath);
  await fse.remove(fileFolder);
}

async function testTTypeScript(filename, content, expectedDeps) {
  const tempPath = await getTempPath(filename, content);
  const deps = ['dummy', ...expectedDeps];
  const result = parse(content, tempPath, deps, __dirname);
  await removeTempFile(tempPath);
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

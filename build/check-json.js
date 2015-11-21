import path from 'path';
import assert from 'assert';

function readStdin() {
  return new Promise(resolve => {
    const chunks = [];

    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        chunks.push(chunk);
      }
    });

    process.stdin.on('end', () => {
      const stdin = chunks.join('');
      resolve(stdin);
    });
  });
}

function check(result) {
  const badJsFile = path.resolve(__dirname, '../test/fake_modules/bad_js/index.js');
  return new Promise(() => {
    assert.deepEqual(result.dependencies, []);
    assert.deepEqual(result.devDependencies, []);
    assert.deepEqual(result.invalidDirs, {});
    assert.deepEqual(Object.keys(result.invalidFiles), [badJsFile]);
  });
}

async function main() {
  const stdin = await readStdin();
  const result = JSON.parse(stdin);

  console.log(result); // eslint-disable-line no-console

  check(result).catch(error => {
    console.error(error.stack); // eslint-disable-line no-console
    process.exit(-1);
  });
}

main();

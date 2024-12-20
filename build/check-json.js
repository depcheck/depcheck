import assert from 'assert';
import metadata from '../package.json';

function readStdin() {
  return new Promise((resolve) => {
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
  return new Promise(() => {
    assert.deepEqual(result.dependencies, []);
    assert.deepEqual(result.devDependencies, []);
    assert.deepEqual(result.missing, {});
    assert.deepEqual(result.invalidDirs, {});
    assert.deepEqual(result.invalidFiles, {});

    // assert all dependencies in package.json are using
    const declaredDeps = Object.keys(metadata.dependencies);
    const declaredDevDeps = Object.keys(metadata.devDependencies);
    assert.deepEqual(
      Object.keys(result.using).sort(),
      declaredDeps.concat(declaredDevDeps).sort(),
    );
  });
}

async function main() {
  const stdin = await readStdin();
  const result = JSON.parse(stdin);

  console.log(result);

  check(result).catch((error) => {
    console.error(error.stack);
    process.exit(-1);
  });
}

main();

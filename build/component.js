/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

function unify(list) {
  return list.map((item) => path.basename(item, '.js'));
}

function getList(name) {
  return new Promise((resolve) =>
    fs.readdir(path.resolve(__dirname, '../src', name), (error, list) =>
      resolve(error || unify(list)),
    ),
  );
}

let compFunction;

if (process.argv.length > 2) {
  // Writing index.d.ts
  const templateReader = readline.createInterface({
    input: fs.createReadStream(process.argv[2]),
  });
  const printItemTypes = (itemName, itemType, items) => {
    console.log(`\n  const ${itemName}: {`);
    items.forEach((item) => console.log(`    '${item}': ${itemType};`));
    console.log('  };');
  };
  compFunction = ([parser, detector, special]) => {
    templateReader.on('line', (line) => {
      if (line === '«Components»') {
        printItemTypes('parser', 'Parser', parser);
        printItemTypes('detector', 'Detector', detector);
        printItemTypes('special', 'SpecialParser', special);
      } else {
        console.log(line);
      }
    });
  };
} else {
  // Writing components.json
  compFunction = ([parser, detector, special]) => {
    console.log(
      JSON.stringify(
        {
          parser,
          detector,
          special,
        },
        null,
        2,
      ),
    );
  };
}

Promise.all([getList('parser'), getList('detector'), getList('special')]).then(
  compFunction,
);

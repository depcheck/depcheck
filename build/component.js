// eslint-disable-next-line import/no-extraneous-dependencies
import * as babel from '@babel/core';
import * as fs from 'fs';
import { basename, join } from 'path';

const fromDirname = (...p) => join(__dirname, ...p);
const fromDist = (...p) => join(__dirname, '../dist', ...p);

const components = ['parser', 'detector', 'special'];
const lists = components.map((name) =>
  fs
    .readdirSync(fromDirname('../src', name))
    .map((item) => basename(item, '.js')),
);

const [parser, detector, special] = lists;

// Generate index.d.ts
const typesTemplate = fs.readFileSync(fromDirname('../index.d.tmpl'), 'utf-8');
fs.writeFileSync(
  fromDist('index.d.ts'),
  typesTemplate.replace(
    '«Components»',
    [
      [parser, 'parser', 'Parser'],
      [detector, 'detector', 'Detector'],
      [special, 'special', 'Parser'],
    ]
      .flatMap(
        ([items, itemName, itemType]) => `
  const ${itemName}: {
${items.map((item) => `    '${item}': ${itemType}`).join('\n')};
  };
`,
      )
      .join('\n'),
  ),
  'utf-8',
);

// Writing components.json
fs.writeFileSync(
  fromDist('component.json'),
  JSON.stringify(
    {
      parser,
      detector,
      special,
    },
    null,
    2,
  ),
  'utf-8',
);

// Writing index files
components.forEach((component, index) => {
  // something like this also does `create-index` package
  const list = lists[index];
  const result = babel.transformSync(
    list
      .map(
        (itemName) =>
          `export { default as "${itemName}" } from './${itemName}';`,
      )
      .join('\n'),
    {
      configFile: fromDirname('../.babelrc'),
    },
  );
  fs.writeFileSync(fromDist(component, 'index.js'), result.code, 'utf-8');
});

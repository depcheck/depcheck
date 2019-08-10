import { readFile } from 'fs';

export default function readLinesSeaparatedFile(filePath) {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }

      return resolve(content.split(/\r?\n/));
    });
  });
}

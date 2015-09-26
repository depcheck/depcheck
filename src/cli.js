import yargs from 'yargs';
import checkDirectory from './index';
import fs from 'fs';
import path from 'path';

function checkPathExist(dir) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, result => result ? resolve() : reject()));
}

function noUnused(unused) {
  return unused.dependencies.length === 0
      && unused.devDependencies.length === 0;
}

function prettify(caption, deps) {
  const list = deps.map(dep => `- ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

export default function cli(args, log, error, exit) {
  const opt = yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean('dev')
    .default('dev', true)
    .describe('dev', 'Check on devDependecies')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignoreDirs', 'Comma separated folder names to ignore')
    .describe('help', 'Show this help message');

  if (opt.argv.help) {
    log(opt.help());
    exit(0);
  } else {
    const dir = opt.argv._[0] || '.';
    const rootDir = path.resolve(dir);

    checkPathExist(rootDir)
    .catch(() => {
      error('Path ' + dir + ' does not exist');
      exit(-1);
    })
    .then(() => checkPathExist(path.resolve(rootDir, 'package.json')))
    .catch(() => {
      error('Path ' + dir + ' does not contain a package.json file');
      log(opt.help());
      exit(-1);
    })
    .then(() => checkDirectory(rootDir, {
      withoutDev: !opt.argv.dev,
      ignoreMatches: (opt.argv.ignores || '').split(','),
      ignoreDirs: (opt.argv.ignoreDirs || '').split(','),
    }, unused => {
      if (opt.argv.json) {
        log(JSON.stringify(unused));
        exit(0);
      } else if (noUnused(unused)) {
        log('No unused dependencies');
        exit(0);
      } else {
        log(prettify('Unused Dependencies', unused.dependencies)
          .concat(prettify('Unused devDependencies', unused.devDependencies))
          .join('\n'));
        exit(-1);
      }
    }));
  }
}

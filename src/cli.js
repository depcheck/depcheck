import optimist from 'optimist';
import checkDirectory from './index';
import fs from 'fs';
import path from 'path';

function run(absolutePath, argv, log, exit) {
  checkDirectory(absolutePath, {
    'withoutDev': !argv.dev,
    'ignoreMatches': (argv.ignores || '').split(','),
  }, unused => {
    if (argv.json) {
      log(JSON.stringify(unused));
      return exit(0);
    }

    if (unused.dependencies.length === 0 && unused.devDependencies.length === 0) {
      log('No unused dependencies');
      exit(0);
    } else {
      if (unused.dependencies.length !== 0) {
        log('Unused Dependencies');
        unused.dependencies.forEach(u => {
          log('* ' + u);
        });
      }
      if (unused.devDependencies.length !== 0) {
        log();
        log('Unused devDependencies');
        unused.devDependencies.forEach(u => {
          log('* ' + u);
        });
      }
      exit(-1);
    }
  });
}

export default function cli(args, log, error, exit) {
  const opt = optimist(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean('dev')
    .default('dev', true)
    .describe('no-dev', 'Don\'t look at devDependecies')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('help', 'Show this help message');

  const argv = opt.argv;

  if (argv.help) {
    log(opt.help());
    exit(0);
  }

  const dir = argv._[0] || '.';
  const absolutePath = path.resolve(dir);

  fs.exists(absolutePath, pathExists => {
    if (pathExists) {
      fs.exists(absolutePath + path.sep + 'package.json', exists => {
        if (exists) {
          run(absolutePath, argv, log, exit);
        } else {
          error('Path ' + dir + ' does not contain a package.json file');
          opt.showHelp();
          exit(-1);
        }
      });
    } else {
      error('Path ' + dir + ' does not exist');
      exit(-1);
    }
  });
}

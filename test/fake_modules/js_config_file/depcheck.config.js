module.exports = {
  parsers: {
    '*.js': 'es6',
    '*.txt': () => ['foo'],
  },
  detectors: [() => ['bar']],
  specials: [() => ['baz']],
};

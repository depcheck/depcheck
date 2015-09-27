function parser(prefix, content) {
  return content
    .split('\n')
    .filter(line => line.startsWith(prefix))
    .map(line => ({
      type: 'ImportDeclaration',
      source: {
        value: line.substring(prefix.length),
      },
    }));
}

export const multipleParserA = content =>
  parser('parser_a,', content);

export const multipleParserB = content =>
  parser('parser_b,', content);

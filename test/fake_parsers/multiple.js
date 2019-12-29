function parser(prefix, content) {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.startsWith(prefix))
    .map((line) => ({
      type: 'ImportDeclaration',
      source: {
        type: 'Literal',
        value: line.substring(prefix.length),
      },
    }));
}

export const multipleParserA = (content) => parser('parser_a,', content);

export const multipleParserB = (content) => parser('parser_b,', content);

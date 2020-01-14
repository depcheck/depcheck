import { getContent } from '../../src/utils/file';

export default async (filename) => {
  const content = await getContent(filename);
  throw new SyntaxError(content); // throws syntax error any way
};

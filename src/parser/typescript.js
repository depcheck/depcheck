import { parse } from 'babylon';

function tryRequire(module) {
  try {
    return require(module);
  } catch (e) {
    return null;
  }
}

const typescript = tryRequire('typescript');

export default function parseTypescript(content, filePath) {
  if (!typescript) {
    return [];
  }

  const compileOptions = {
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.Latest,
  };

  const result = typescript.transpile(
    content,
    compileOptions,
    filePath);

  // TODO avoid parse source file twice, use Typescript native traverser to find out dependencies.
  // Reference: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
  return parse(result, {
    sourceType: 'module',
  });
}

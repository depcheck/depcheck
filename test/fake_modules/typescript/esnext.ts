import Dep from 'ts-dep-esnext';
import '@org/org-pkg';
import * as path from 'path';

export const ObjRestSpread = () => {
  const a = {a: 1, b: 2};
  const { b, ...rest } = a;
  const c = {...a, ...rest};
  path.resolve('/', 'home');
  new Dep(c);
}

import Dep from 'ts-dep-esnext';

export const ObjRestSpread = () => {
  const a = {a: 1, b: 2};
  const { b, ...rest } = a;
  const c = {...a, ...rest};
  new Dep(c);
}

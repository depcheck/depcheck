import DepType = require('ts-dep-1');
import DepClass from 'ts-dep-2';
const Dep3 = await import('ts-dep-3');

export interface Interface {
  dep: DepType;
}

export class MyClass extends DepClass {
  public dep = new DepType();
}

export function genDepTypeInterface(): Interface {
  const res = { dep: new DepType() } satisfies Interface;
  return res;
}

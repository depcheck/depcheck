import DepType = require('ts-dep-1');
import DepClass from 'ts-dep-2';

export interface Interface {
  dep: DepType;
}

export class MyClass extends DepClass {
  public dep = new DepType();
}

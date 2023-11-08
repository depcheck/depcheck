import type { Foo } from 'typeless-module';
import type { Bar } from 'another-typeless-module/nested-declaration-file';

const foo: Foo = { prop: 'here' };
const bar: Bar = { prop: 'there' };

export default { foo, bar };

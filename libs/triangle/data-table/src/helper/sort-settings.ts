/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export type ColumnSortSettings =
  | boolean
  | {
  allowUnsort?: boolean;
};

export type SortSettings =
  | boolean
  | ColumnSortSettings & {
  mode: 'single' | 'multiple';
};
const DEFAULTS: any = {
  allowUnsort     : true,
  mode            : 'single',
  showIndexes     : true,
  initialDirection: 'asc'
};
export const normalize: (...settings: (
  | boolean
  | {
  allowUnsort?: boolean;
}
  | (true & {
  mode?: 'single' | 'multiple';
})
  | (false & {
  mode?: 'single' | 'multiple';
})
  | ({
  allowUnsort?: boolean;
} & {
  mode?: 'single' | 'multiple';
}))[]) => any = (...settings: any[]) => {
  // @ts-ignore
  return Object.assign.apply(Object, [DEFAULTS].concat(settings));
};

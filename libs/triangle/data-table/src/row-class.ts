/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export interface RowArgs {
  /**
   * The current row data.
   */
  dataItem: any;
  /**
   * The current row index.
   */
  index: number;
}

export interface RowClassArgs extends RowArgs {
}

export type RowClassFn = (context: RowClassArgs) =>
  | string
  | string[]
  | Set<string>
  | {
  [key: string]: any;
};

export type RowSelectedFn = (context: RowArgs) => boolean;

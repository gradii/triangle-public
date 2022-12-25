/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export interface PageChangeEvent {
  skip: number;

  take: number;

  pageIndex: number;

  pageSize: number;

  total: number;
}

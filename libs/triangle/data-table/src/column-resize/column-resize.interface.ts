/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Observable } from 'rxjs';

import { ColumnBase } from '../columns/column-base';

/**
 * The returned type of the `columnResize` event.
 */
export interface ColumnResizeArgs {
  /**
   * The resized column.
   */
  column: ColumnBase;

  /**
   * The new width of the column.
   */
  newWidth?: number;

  /**
   * The actual width of the column prior to resizing.
   */
  oldWidth: number;
}

/**
 * @hidden
 */
export type ActionType =
  'start' |
  'resizeColumn' |
  'resizeTable' |
  'end' |
  'autoFitComplete' |
  'triggerAutoFit';

/**
 * @hidden
 */
export interface ColumnResizeAction {
  columns: Array<ColumnBase>;
  delta?: number;
  deltaPercent?: number;
  locked?: boolean;
  resizedColumns?: Array<ColumnResizeArgs>;
  type: ActionType;
  widths?: Array<Array<number>>;
}

/**
 * @hidden
 */
export interface AutoFitInfo {
  column: ColumnBase;
  headerIndex: number;
  index: number;
  isLastInSpan: boolean;
  isParentSpan: boolean;
  level: number;
}

/**
 * @hidden
 */
export type AutoFitObservable = Observable<Array<number>>;

/**
 * @hidden
 */
export type AutoFitFn = (columns: Array<AutoFitInfo>) => AutoFitObservable;

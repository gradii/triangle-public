/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * @hidden
 */
export const hasFilter = (settings: any, column: any): boolean => settings.filter && column.field && column.filterable;

/**
 * @hidden
 */
export const hasSort = (settings: any, column: any): boolean => settings.sort && column.field && column.sortable;

/**
 * @hidden
 */
export const hasLock = (settings: any, column: any): boolean =>
  settings.lock && column.lockable && !(column.parent && !column.parent.isSpanColumn);

/**
 * @hidden
 */
export const hasColumnChooser = (settings: any): boolean => settings.columnChooser !== false;

/**
 * @hidden
 */
export const hasItems = (settings: any, column: any): boolean =>
  hasColumnChooser(settings) || hasLock(settings, column) || hasSort(settings, column) || hasFilter(settings, column);

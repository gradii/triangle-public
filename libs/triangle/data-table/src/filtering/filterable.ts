/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * Represents the options for the `filterable` setting of the Grid.
 */
export type FilterableSettings = boolean | 'row' | 'menu' | 'menu, row' | 'simple';

export const isFilterable = (settings: FilterableSettings) => settings !== false;

export const hasFilterMenu = (settings: FilterableSettings) =>
  typeof settings === 'string' && settings.indexOf('menu') > -1;

export const hasFilterSimple = (settings: FilterableSettings) =>
  typeof settings === 'string' && settings.indexOf('simple') > -1;

export const hasFilterRow = (settings: FilterableSettings) =>
  settings === true || (typeof settings === 'string' && settings.indexOf('row') > -1);

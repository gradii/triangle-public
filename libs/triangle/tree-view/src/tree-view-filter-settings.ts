/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export type MatcherFunction = (dataItem: any, searchTerm: string) => boolean;

export interface TreeViewFilterSettings {
  /**
   * The filter operator (comparison).
   *
   * The supported operators are:
   * * `"contains"`
   * * `"doesnotcontain"`
   * * `"startswith"`
   * * `"doesnotstartwith"`
   * * `"endswith"`
   * * `"doesnotendwith"`
   *
   * The default operator is `"contains"`.
   *
   * A custom matcher function can also be provided to the filter settings object:
   * @example
   * ```ts
   * const matcher: MatcherFunction = (dataItem: object, searchTerm: string) => dataItem.firstName.indexOf(searchTerm) >= 0;
   * ```
   */
  operator?: 'contains' | 'doesnotcontain' | 'startswith' | 'doesnotstartwith' | 'endswith' | 'doesnotendwith' | MatcherFunction;
  /**
   * Determines if the string comparison is case-insensitive.
   * By defualt, a case-insensitive filtering will be performed.
   */
  ignoreCase?: boolean;
  /**
   * Determines the behavior of the filtering algorithm.
   * - `"strict"`&mdash;does not show child nodes of filter matches. Instead, only matching nodes themselves are displayed.
   * - `"lenient"`&mdash;all child nodes of each filter match are included in the filter results.
   *
   * The default mode is `"lenient"`
   */
  mode?: 'strict' | 'lenient';
}

/**
 * @hidden
 */
export const DEFAULT_FILTER_SETTINGS = {
  operator  : 'contains',
  ignoreCase: true,
  mode      : 'lenient'
};

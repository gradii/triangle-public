/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';

/**
 * Injection token used to provide a grid list to a tile and to avoid circular imports.
 * @docs-private
 */
export const TRI_GRID_LIST = new InjectionToken<TriGridListBase>('TRI_GRID_LIST');

/**
 * Base interface for a `TriGridList`.
 * @docs-private
 */
export interface TriGridListBase {
  cols: number;
  gutterSize: string;
  rowHeight: number | string;
}

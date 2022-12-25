/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';

export const CELL_CONTEXT = new InjectionToken('grid-cell-context');

export interface CellContext {
  rowIndex?: number;
}

export const EMPTY_CELL_CONTEXT = {};

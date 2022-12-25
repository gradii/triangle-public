/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DataTableComponent } from '../data-table.component';

export interface EditEvent {
  dataItem: any;
  isNew: boolean;
  rowIndex: number;
  sender: DataTableComponent;
}

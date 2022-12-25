/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CompositeFilterDescriptor } from '@gradii/triangle/data-query';
import { ColumnComponent } from '../columns/column.component';

export interface FilterComponent {
  column: ColumnComponent;
  filter: CompositeFilterDescriptor;
}

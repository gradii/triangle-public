/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CompositeFilterDescriptor } from './filtering/filter-descriptor.interface';
import { GroupDescriptor } from './grouping/group-descriptor.interface';
import { SortDescriptor } from './sort-descriptor';

export interface State {
  skip?: number;
  take?: number;
  sort?: Array<SortDescriptor>;
  filter?: CompositeFilterDescriptor;
  group?: Array<GroupDescriptor>;
}

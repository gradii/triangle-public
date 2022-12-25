/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AggregateResult } from '../transducers';
import { AggregateDescriptor } from './aggregate.operators';

export interface GroupDescriptor {
  field: string;
  dir?: 'asc' | 'desc';
  aggregates?: Array<AggregateDescriptor>;
}

export interface GroupResult {
  items: Object[];
  aggregates: AggregateResult;
  field: string;
  value: any;
}

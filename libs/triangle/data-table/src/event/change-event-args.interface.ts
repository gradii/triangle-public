/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  CompositeFilterDescriptor,
  GroupDescriptor,
  SortDescriptor
} from '@gradii/triangle/data-query';

export interface PageChangeEvent {
  skip: number;

  take: number;
}

export interface DataStateChangeEvent {
  skip: number;

  take: number;

  sort?: SortDescriptor[];

  group?: GroupDescriptor[];

  filter?: CompositeFilterDescriptor;
}

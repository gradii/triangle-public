/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { GroupResult } from '@gradii/triangle/data-query';

export interface GroupItem {
  type: 'group';
  data: GroupResult;
  index: string;
  level: number;
}

export interface GroupFooterItem {
  type: 'footer';
  data: GroupResult;
  groupIndex: string;
  level: number;
}

export interface Item {
  type: 'data';
  data: Object;
  index: number;
  groupIndex: string;
}

export interface HierarchyItem {
  type: 'hierarchy-data';
  data: Object;
  index: number;
  groupIndex: string;
  children: HierarchyItem[];
}

export interface IteratorResult<T> {
  done: boolean;
  value: T;
}

export interface IteratorState {
  footers?: boolean;
  level?: number;
  dataIndex?: number;
  parentGroupIndex?: string;
  groupIndex?: number;
}

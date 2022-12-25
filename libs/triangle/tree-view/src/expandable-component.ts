/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';
import { FilterState } from './filter-state.interface';
import { TreeItem } from './tree-item.interface';

@Injectable()
export abstract class ExpandableComponent {
  abstract isExpanded: (item: any, index: string) => boolean;
  abstract expand: EventEmitter<TreeItem>;
  abstract collapse: EventEmitter<TreeItem>;
  abstract filterStateChange: EventEmitter<FilterState>;
}

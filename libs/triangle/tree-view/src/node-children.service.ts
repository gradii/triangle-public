/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeItem } from './tree-item.interface';

/**
 * @deprecated use tree view control instead
 */
@Injectable()
export class NodeChildrenService {
  changes: Subject<{ item: TreeItem; children: TreeItem[]; }>;

  /**
   * @hidden
   */
  constructor() {
    this.changes = new Subject();
  }

  childrenLoaded(item: TreeItem, children: TreeItem[]) {
    this.changes.next({item, children});
  }
}

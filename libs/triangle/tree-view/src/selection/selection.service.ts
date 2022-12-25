/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeViewNode } from '../data-source/tree-view.data-source.node';

/**
 * will move to tree view control
 * @deprecated
 */
@Injectable()
export class SelectionService {
  readonly changes: Subject<{ node: TreeViewNode; uid: string; }>;
  firstIndex: any;

  /**
   * @hidden
   */
  constructor() {
    this.changes = new Subject();
  }

  isFirstSelected(index: string) {
    return this.firstIndex === index;
  }

  setFirstSelected(index: string, selected: boolean) {
    if (this.firstIndex === index && selected === false) {
      this.firstIndex = null;
    } else if (!this.firstIndex && selected) {
      this.firstIndex = index;
    }
  }

  select(uid: string, node: TreeViewNode) {
    this.changes.next({node, uid});
  }
}

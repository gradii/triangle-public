/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeViewNode } from './data-source/tree-view.data-source.node';

@Injectable()
export class ExpandStateService {
  changes: Subject<{
    dataItem: any;
    expand: boolean;
    /**
     * @deprecated
     */
    index?: string;
    uid: string;
  }>;

  /**
   * @hidden
   */
  constructor() {
    this.changes = new Subject();
  }

  expand(/*index: any, */node: TreeViewNode) {
    this.changes.next({dataItem: node, uid: node.uid, expand: true});
  }

  collapse(/*index: any, */node: TreeViewNode) {
    this.changes.next({dataItem: node, uid: node.uid, expand: false});
  }
}

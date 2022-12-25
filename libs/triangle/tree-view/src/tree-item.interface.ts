/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeViewNode } from './data-source/tree-view.data-source.node';

/**
 * Represents a TreeView node.
 */
export interface TreeItem {
  node: TreeViewNode;
  uid: string;
}

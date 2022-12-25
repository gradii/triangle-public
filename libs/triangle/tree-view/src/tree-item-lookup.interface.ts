/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeItem } from './tree-item.interface';


export interface TreeItemLookup {
  /**
   *  The current TreeItem instance.
   */
  item: TreeItem;
  /**
   * The lookup details for the parent of the current TreeView node.
   */
  parent?: TreeItemLookup;
  /**
   *  The lookup details for the children of the current TreeView node.
   */
  children?: TreeItem[];
}

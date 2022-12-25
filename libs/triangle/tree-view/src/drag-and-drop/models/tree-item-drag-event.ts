/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeItemLookup } from '../../tree-item-lookup.interface';

/**
 * Arguments for the TreeView [`nodeDrag`]({% slug api_tree-view_tree-viewcomponent %}#toc-nodedrag) and
 * [`nodeDragEnd`]({% slug api_tree-view_tree-viewcomponent %}#toc-nodedragend) events.
 */
export class TreeItemDragEvent {
  sourceItem: TreeItemLookup;
  destinationItem: TreeItemLookup;
  originalEvent: PointerEvent;
}

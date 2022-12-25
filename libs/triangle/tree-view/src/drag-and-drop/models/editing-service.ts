/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeItemAddRemoveArgs } from './tree-item-add-remove-args';

/**
 * Specifies the handlers called on drag-and-drop [`addItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-additem)
 * and [`removeItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-removeitem) events.
 */
export interface EditService {
  /**
   * The event handler called when the drag-and-drop
   * [`addItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-additem) event is fired.
   */
  add: (args: TreeItemAddRemoveArgs) => void;
  /**
   * The event handler called when the drag-and-drop
   * [`removeItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-removeitem) event is fired.
   */
  remove: (args: TreeItemAddRemoveArgs) => void;
}


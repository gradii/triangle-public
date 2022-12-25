/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeViewComponent } from '../../tree-view.component';
import { TreeItemLookup } from '../../tree-item-lookup.interface';
import { DropPosition } from './drop-position';
import { PreventableEvent } from './preventable-event';
import { TreeItemAddRemoveArgs } from './tree-item-add-remove-args';

/**
 * Arguments for the TreeView [`nodeDrop`]({% slug api_tree-view_tree-viewcomponent %}#toc-nodedrop) event.
 */
export class TreeItemDropEvent extends PreventableEvent implements TreeItemAddRemoveArgs {
  sourceTree: TreeViewComponent;
  destinationTree: TreeViewComponent;
  sourceItem: TreeItemLookup;
  destinationItem: TreeItemLookup;
  dropPosition: DropPosition;
  originalEvent: PointerEvent;
  isValid: boolean;

  /**
   * @hidden
   */
  constructor(initializer: TreeItemAddRemoveArgs, originalEvent: PointerEvent) {
    super();
    /**
     * @hidden
     */
    this.isValid = true;
    Object.assign(this, initializer);
    this.originalEvent = originalEvent;
  }

  /**
   * Specifies if the drop action should be marked as valid.
   * If set to `false`, the [`addItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-additem) and
   * [`removeItem`]({% slug api_tree-view_tree-viewcomponent %}#toc-removeitem) events will not be fired and the drag clue
   * will be animated back to the source item to indicate the action is marked as invalid.
   */
  setValid(isValid: boolean) {
    this.isValid = isValid;
  }
}

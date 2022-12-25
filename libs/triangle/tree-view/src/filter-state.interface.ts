/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TreeItemFilterState } from './drag-and-drop/models/tree-item-filter-state';
import { TreeViewFilterSettings } from './tree-view-filter-settings';

/**
 * Information about the current filter state of each node in the component.
 * Emitted by the [`filterStateChange`](<!-- href:api_tree-view_tree-viewcomponent-example ->)
 */
export interface FilterState {
  /**
   * The list of TreeView node wrappers which contain metadata about the current filtered state of the component.
   * Useful for custom implementations of auto-expanding nodes triggered by filtering.
   */
  nodes: TreeItemFilterState[];
  /**
   * The number of nodes which match the current filter term.
   */
  matchCount: number;
  /**
   * The current filter term of the TreeView.
   */
  term: string;
  /**
   * The settings according to which the current filter was performed.
   */
  filterSettings: TreeViewFilterSettings;
}

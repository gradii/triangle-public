/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/**
 * These objects wrap each hierarchical node of the component.
 * Represents a lookup structure which persists information about the current node, its filter state, parent and child nodes. Used in the [`filterStateChange`]({% slug api_tree-view_tree-viewcomponent %}#toc-filterstatechange).
 */
export interface TreeItemFilterState {
  /**
   * The dataItem of the node.
   */
  dataItem: any;
  /**
   * The hierarchical index of the node.
   */
  index: string;
  /**
   * The node's parent node.
   */
  parent: TreeItemFilterState;
  /**
   * The node's child nodes.
   */
  children?: TreeItemFilterState[];
  /**
   * Whether the node is a filter match.
   */
  isMatch?: boolean;
  /**
   * Whether the node is visible or filtered out.
   * Sometimes a node is visible but is not a match.
   * For example, it's part of the parent chain of a match, or a child of a matching node in lenient filter mode.
   */
  visible: boolean;
  /**
   * Whether one of the node's children is a match or contains matches.
   */
  containsMatches?: boolean;
}


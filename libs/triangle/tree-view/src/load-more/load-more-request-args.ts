/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/**
 * Represents the arguments passed to the [`loadMoreNodes`]({% slug api_tree-view_loadmoredirective %}#toc-kendotree-viewloadmore)
 * function when a load more button is pressed.
 */
export interface LoadMoreRequestArgs {
  /**
   * Points to the data item for which more child nodes are requested.
   */
  dataItem: any;
  /**
   * Indicates how many items are currently rendered.
   */
  skip: number;
  /**
   * Indicates how many new items are requested. This value equals the initial [`pageSize`]({% slug api_tree-view_loadmoredirective %}#toc-pagesize) passed to the
   * [`kendoTreeViewLoadMore`]({% slug api_tree-view_loadmoredirective %}) directive. It's not required to conform to this value -
   * the current data item page size will be incremented with as many items are returned by the [`loadMoreNodes`]({% slug api_tree-view_loadmoredirective %}#toc-kendotree-viewloadmore) function.
   */
  take: number;
}


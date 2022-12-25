/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Observable } from 'rxjs';
import { LoadMoreRequestArgs } from './load-more-request-args';

/** @hidden */
export interface LoadMoreStrategy {

  withLoadMoreNodesCallback(loadMoreNodesCallback: (loadMoreArgs: LoadMoreRequestArgs) => Observable<any[]>);

  /**
   * Specifies the callback that will be executed when the load more button is clicked.
   * Providing a `loadMoreNodes` function is only required when additional nodes are fetched from the server on demand.
   */
  loadMoreNodes?: (loadMoreArgs: LoadMoreRequestArgs) => Observable<any[]>;
  /**
   * Specifies the initial number of nodes that will be rendered for the specified data item children group.
   * Every time the load more button is clicked, the data item page size will be incremented with this number.
   */
  getInitialPageSize: (dataItem: any) => number;
  /**
   * Gets the current page size for the targeted data item children collection.
   */
  getGroupSize: (dataItem: any) => number;
  /**
   * Sets the current page size for the targeted data item children collection.
   */
  setGroupSize: (dataItem: any, pageSize: number) => void;
  /**
   * Retrieves the total number of child nodes for the targeted data item.
   *
   * @param dataItem The parent item of the checked group.
   * @param loadedNodesCount The number of already loaded nodes via the `children` function.
   */
  getTotalNodesCount: (dataItem: any, loadedNodesCount: number) => number;
}


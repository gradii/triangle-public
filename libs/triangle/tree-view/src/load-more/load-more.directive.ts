/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input, isDevMode } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { TreeViewComponent } from '../tree-view.component';
import { DefaultLoadMoreStrategy } from './default-load-more-strategy';
import { LoadMoreRequestArgs } from './load-more-request-args';


@Directive({
  selector : '[triTreeViewLoadMore]',
  providers: [
    DefaultLoadMoreStrategy
  ],
  inputs   : [
    'loadMoreNodes:triTreeViewLoadMore'
  ]
})
export class LoadMoreDirective {
  @Input()
  pageSize: number;

  @Input()
  totalRootNodes: number;

  @Input()
  totalField: string;

  /**
   * Keeps track of the current page size of each node over expand/collapse cycles.
   */
  pageSizes: Map<string, number> = new Map();
  rootLevelId: string;

  constructor(public treeView: TreeViewComponent,
              private _loadMoreServiceStrategy: DefaultLoadMoreStrategy) {
    /**
     * Used as an identifier for the root page size as the root collection of nodes is not associated with a data item.
     */
    this.rootLevelId = uuid();
    this.treeView.loadMoreStrategy = _loadMoreServiceStrategy;
  }

  /**
   * Specifies the callback that will be called when the load more button is clicked.
   * Providing a function is only required when additional nodes are fetched on demand
   */
  set loadMoreNodes(loadMoreNodes: string | ((loadMoreArgs: LoadMoreRequestArgs) => Observable<any[]>)) {
    if (typeof loadMoreNodes === 'string') {
      return;
    }
    this.treeView.loadMoreStrategy.withLoadMoreNodesCallback(loadMoreNodes);
  }

  ngOnChanges() {
    this.verifySettings();
    this._loadMoreServiceStrategy
      .withPageSize(this.pageSize)
      .withPageSizes(this.pageSizes)
      .withTotalRootNodes(this.totalRootNodes)
      .withRootLevelId(this.rootLevelId)
      .withTotalField(this.totalField);
  }

  verifySettings(): any {
    if (!isDevMode()) {
      return;
    }
    if (!isPresent(this.pageSize)) {
      throw new Error(`pageSize is required.`);
    }
    const loadMoreNodes = this.treeView.loadMoreStrategy.loadMoreNodes;
    if (isPresent(loadMoreNodes) && typeof loadMoreNodes !== 'function') {
      throw new Error(`loadMoreNodes is required.`);
    }
    if (isPresent(loadMoreNodes) && !isPresent(this.totalField)) {
      throw new Error(`the \`totalField\` and \`totalRootNodes\` is required.`);
    }
  }
}

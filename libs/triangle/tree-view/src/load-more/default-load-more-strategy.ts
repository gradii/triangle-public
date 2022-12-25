import { Injectable } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Observable } from 'rxjs';
import { LoadMoreRequestArgs } from './load-more-request-args';
import { LoadMoreStrategy } from './load-more-strategy';

@Injectable()
export class DefaultLoadMoreStrategy implements LoadMoreStrategy {
  _pageSizes: Map<string, number>;
  _rootLevelId: string;
  _pageSize: number;
  _totalField: string;
  _totalRootNodes: number;
  _loadMoreNodesCallback: (loadMoreArgs: LoadMoreRequestArgs) => Observable<any[]>;

  withPageSize(pageSize: number) {
    this._pageSize = pageSize;
    return this;
  }

  withRootLevelId(rootLevelId: string) {
    this._rootLevelId = rootLevelId;
    return this;
  }

  withPageSizes(pageSizes: Map<string, number>) {
    this._pageSizes = pageSizes;
    return this;
  }

  withTotalField(totalField: string) {
    this._totalField = totalField;
    return this;
  }

  withTotalRootNodes(totalRootNodes: number) {
    this._totalRootNodes = totalRootNodes;
    return this;
  }

  withLoadMoreNodesCallback(loadMoreNodesCallback: (loadMoreArgs: LoadMoreRequestArgs) => Observable<any[]>) {
    this._loadMoreNodesCallback = loadMoreNodesCallback;
  }

  getInitialPageSize(): any {
    return this._pageSize;
  }

  getGroupSize(dataItem): any {
    const itemKey = dataItem || this._rootLevelId;
    return this._pageSizes.has(itemKey) ? this._pageSizes.get(itemKey) : this._pageSize;
  }

  setGroupSize(dataItem, pageSize): any {
    const itemKey             = dataItem || this._rootLevelId;
    const normalizedSizeValue = pageSize > 0 ? pageSize : 0;
    this._pageSizes.set(itemKey, normalizedSizeValue);
  }

  getTotalNodesCount(dataItem, loadedNodesCount): any {
    if (isPresent(dataItem) && isPresent(this._totalField)) {
      return dataItem[this._totalField];
    } else if (!isPresent(dataItem) && isPresent(this._totalRootNodes)) {
      return this._totalRootNodes;
    } else {
      return loadedNodesCount;
    }
  }
}


// /**
//  *
//  */
//
// export class TreeViewHierarchyDataSource {
//   _childrenField: string | ((dataItem: any) => any[]);
// }

import { Observable } from 'rxjs';
import { TreeViewNode } from './tree-view.data-source.node';

export interface CollectionViewer {
}


export interface TreeViewDataSource {
  connect(collectionViewer: CollectionViewer): Observable<TreeViewNode[]>;

  disconnect(collectionViewer: CollectionViewer): void;
}
import { BehaviorSubject, map, tap } from 'rxjs';
import { CollectionViewer, TreeViewDataSource } from './tree-view.data-source';
import { TreeViewHierarchyControl } from './tree-view.hierarchy-control';


export class TreeViewHierarchyDataSource implements TreeViewDataSource {
  _data = new BehaviorSubject([]);

  constructor(
    data: any[],
    public treeControl: TreeViewHierarchyControl
  ) {
    this._data.next(data);
  }

  /**
   * @param collectionViewer
   */
  connect(collectionViewer: CollectionViewer) {
    return this._data.pipe(
      map(list => {
        // const rootNode = new TreeViewNode(this.childrenField, null, dataSourceModel, null);
        return list.map(it => this.treeControl.transformToNode(it, null));
      }),
      tap((list) => {
        this.treeControl.renderTreeViewNodes = list;
        this.treeControl.filterModel.filterData = list;
        this.treeControl.checkAllNode();
      }),
    );
  }

  disconnect() {
  }
}
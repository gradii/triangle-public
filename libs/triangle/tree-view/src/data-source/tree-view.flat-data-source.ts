import { BehaviorSubject } from 'rxjs';
import { TreeViewNode } from './tree-view.data-source.node';

export interface CollectionViewer {
}

export class FlatTreeViewDataSource {

  private _dataChange = new BehaviorSubject<any[]>([]);

  get data(): any[] {
    return this._dataChange.value;
  }

  set data(value: any[]) {
    this._dataChange.next(value);
  }

  constructor() {
  }

  connect(collectionViewer: CollectionViewer): any {
    return this._dataChange.asObservable().pipe(
      // tap(data => {
      //   this._treeViewDataSourceModel.initRenderTreeViewNodes(data);
      // })
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

  load(treeViewNodes: TreeViewNode[]) {
    this.data = treeViewNodes;
  }

  hasChildren = (item) => {
    this._dataChange.value.includes(item => item.parentNode === item);
  };

  fetchChildren = (item) => {
    // this._dataChange.value.filter(item => item.parentNode === item)
    //   .map(it => new TreeViewNode('children', it, this, item));
  };
}

import { getter } from '@gradii/nanofn';
import { Observable, of, Subject } from 'rxjs';
import { TreeViewNode, TreeViewNodeFlags } from './tree-view.data-source.node';
import { _getFlag } from './tree-view.data-source.utils';

export class TreeViewFlatControl {
  // checkControl   = new TreeViewCheckControl(this);
  // expandControl  = new TreeViewExpandControl(this);
  // disableControl = new TreeViewDisableControl(this);
  // selectControl  = new TreeViewSelectableControl(this);

  public renderTreeViewNodes: TreeViewNode[];

  loadChildrenChanges = new Subject();

  isVisible(node: TreeViewNode): boolean {
    return _getFlag(node, TreeViewNodeFlags.Visible);
  }

  constructor(public childrenField: string,
              ) {
  }

  hasChildren = (item) => {
    const children = getter(item, this.childrenField);
    return Boolean(children && children.length);
  };

  fetchChildren = (item) => {
    return of(getter(item, this.childrenField)).pipe(
      // map(list => {
      //   return list.map(it => new TreeViewNode(this.childrenField, it, this, item));
      // })
    );
  };

  withFetchChildrenOnExpand(fetchChildrenCallback: (item) => Observable<any>) {
    this.fetchChildren = fetchChildrenCallback;
    return this;
  }
}
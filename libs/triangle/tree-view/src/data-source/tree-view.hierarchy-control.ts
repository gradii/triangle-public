import { getter } from '@gradii/nanofn';
import { BehaviorSubject, map, merge, mergeMap, Observable, of } from 'rxjs';
import { TreeViewCheckEvent, TreeViewCheckModel } from './tree-view-check-model';
import { TreeViewDisableModel } from './tree-view-disable-model';
import { TreeViewExpandEvent, TreeViewExpandModel } from './tree-view-expand-model';
import { TreeViewFilterModel } from './tree-view-filter-model';
import { TreeViewSelectableModel, TreeViewSelectEvent } from './tree-view-selectable-model';
import { TreeViewBaseControl } from './tree-view.base-control';
import { TreeViewNode, TreeViewNodeFlags } from './tree-view.data-source.node';
import { _getFlag, _setFlag, forEachDescendants } from './tree-view.data-source.utils';


export class TreeViewHierarchyControl implements TreeViewBaseControl {
  private _selectModel: TreeViewSelectableModel = new TreeViewSelectableModel();

  get selectModel(): TreeViewSelectableModel {
    return this._selectModel;
  }

  set selectModel(value: TreeViewSelectableModel) {
    this._selectModel = value;
    this.stateChange.next(true);
  }

  private _expandModel: TreeViewExpandModel = new TreeViewExpandModel();

  get expandModel(): TreeViewExpandModel {
    return this._expandModel;
  }

  set expandModel(value: TreeViewExpandModel) {
    this._expandModel = value;
    this.stateChange.next(true);
  }

  private _checkModel: TreeViewCheckModel = new TreeViewCheckModel();

  get checkModel(): TreeViewCheckModel {
    return this._checkModel;
  }

  set checkModel(value: TreeViewCheckModel) {
    this._checkModel = value;
    this.stateChange.next(true);
  }

  private _filterModel: TreeViewFilterModel = new TreeViewFilterModel();

  get filterModel(): TreeViewFilterModel {
    return this._filterModel;
  }

  set filterModel(value: TreeViewFilterModel) {
    this._filterModel = value;
    this.stateChange.next(true);
  }

  public disableModel: TreeViewDisableModel = new TreeViewDisableModel();

  public renderTreeViewNodes: TreeViewNode[] = [];

  isVisible(node: TreeViewNode): boolean {
    return _getFlag(node, TreeViewNodeFlags.Visible);
  }

  setIsVisible(node: TreeViewNode, visible: boolean) {
    _setFlag(node, TreeViewNodeFlags.Visible, visible);
  }

  setMatch(node: TreeViewNode, match: boolean) {
    _setFlag(node, TreeViewNodeFlags.Match, match);
  }

  isFilterMatch(node: TreeViewNode): boolean {
    return _getFlag(node, TreeViewNodeFlags.Match);
  }

  setFilterMath(node: TreeViewNode, match: boolean) {
    _setFlag(node, TreeViewNodeFlags.Match, match);
  }

  isChildFilterMatch(node: TreeViewNode): boolean {
    return _getFlag(node, TreeViewNodeFlags.ChildFilterMatch);
  }

  setChildFilterMatch(node: TreeViewNode, matches: boolean): void {
    _setFlag(node, TreeViewNodeFlags.ChildFilterMatch, matches);
  }

  constructor(
    public childrenField: string,
    public hasChildren   = (item) => {
      const children = getter(item, this.childrenField);
      return Boolean(children && children.length);
    },
    public fetchChildren = (item) => {
      return of(getter(item, this.childrenField)).pipe(
        map(list => {
          return list.map(it => new TreeViewNode(this.childrenField, it, this, item));
        })
      );
    }
  ) {
    this.stateChange.next(true);
  }

  prefetchChildren = (node: TreeViewNode) => {
    if (node.loadedChildren) {
      return node.loadedChildren;
    }

    const list = getter(node.treeViewData, this.childrenField);
    if (list) {
      node.loadedChildren = list
        .map(it => this.transformToNode(it, node));

      return node.loadedChildren;
    }/* else if (isObservable(list)) {
      list.pipe(take(1), filter<any>(Boolean as () => boolean)).subscribe((children: any[]) => {
        const list = []
        for (const child of children) {
          const node = this.transformToNode(child);
          list.push(node);
        }
        node.loadedChildren = list;
      });
    }*/
    return [];
  };

  withHasChildren(hasChildrenCallback: (item) => boolean) {
    this.hasChildren = hasChildrenCallback;
    return this;
  }

  withPreFetchChildren(preFetchChildrenCallback: (item) => any[]) {
    this.prefetchChildren = preFetchChildrenCallback;
    return this;
  }

  withFetchChildren(fetchChildrenCallback: (item) => Observable<any>) {
    this.fetchChildren = fetchChildrenCallback;
    return this;
  }

  checkAllNode() {
    if (!this.renderTreeViewNodes) {
      return;
    }

    //set indeterminate state
    this._checkNodes(this.renderTreeViewNodes);
  }

  _checkNodes(nodes: TreeViewNode[]) {
    nodes.forEach(treeViewNode => {
      const nodeMap = new WeakMap();
      forEachDescendants(
        treeViewNode,
        (node: TreeViewNode) => {
          nodeMap.set(node, 0);
          const parentNode = node.parentNode;
          if (node.isChecked) {
            if (parentNode) {
              const parentNodeCount = nodeMap.get(parentNode);
              nodeMap.set(parentNode, parentNodeCount + 1);
            }
            if (this._checkModel.checkChildren) {
              this._checkModel.checkNode(node, true, true);
              return true;
            }
          }
        },
        (node: TreeViewNode) => {
          const currentNodeCount = nodeMap.get(node);
          const isIndeterminate  = currentNodeCount > 0 && currentNodeCount < node.loadedChildren.length;
          this._checkModel.setIndeterminate(node, isIndeterminate);
        });
    });
  }

  transformToNode(data: any, parentNode?: TreeViewNode): TreeViewNode {
    if (data instanceof TreeViewNode) {
      return data;
    }
    return new TreeViewNode(this.childrenField, data, this, parentNode);
  }

  stateChange: BehaviorSubject<boolean> = new BehaviorSubject(true);

  eventBus: Observable<TreeViewSelectEvent | TreeViewExpandEvent | TreeViewCheckEvent> = this.stateChange.pipe(
    mergeMap(() => merge(
        this._selectModel.selectedKeysChange.asObservable(),
        this._expandModel.expandKeysChange.asObservable(),
        this._checkModel.checkedKeysChange.asObservable(),
        this._filterModel.filterStateChange.asObservable()
      )
    ));
}
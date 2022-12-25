import { Subject } from 'rxjs';
import { TreeViewNode } from './tree-view.data-source.node';


export class TreeViewExpandEvent {
  constructor(public expandedKeys: Set<string>) {
  }
}

/**
 *
 */
export class TreeViewExpandModel {
  expandedBy: string | ((context: TreeViewNode) => any) = 'id';

  protected expandKeys: Set<string> = new Set();

  expandKeysChange:Subject<TreeViewExpandEvent> = new Subject<TreeViewExpandEvent>();

  defaultExpanded: boolean = false;

  constructor(/*public treeViewDataSourceModel: TreeViewDataSourceModel*/) {
  }

  isExpanded(node: TreeViewNode): boolean {
    return this.expandKeys.has(this._itemKey(node));
    // return !_getFlag(node, TreeViewNodeFlags.Collapsed);
  }

  isCollapsed(node: TreeViewNode): boolean {
    return !this.expandKeys.has(this._itemKey(node));
    // return _getFlag(node, TreeViewNodeFlags.Collapsed);
  }

  toggleExpandNode(node: TreeViewNode) {
    this.expandNode(node, !this.isExpanded(node));
    // _setFlag(node, TreeViewNodeFlags.Collapsed, !this.isCollapsed(node));
  }

  expandNode(node: TreeViewNode, bool: boolean, noEmit: boolean = false) {
    if (bool) {
      this.expandKeys.add(this._itemKey(node));
    } else {
      this.expandKeys.delete(this._itemKey(node));
    }
    if (!noEmit) {
      this.expandKeysChange.next(new TreeViewExpandEvent(this.expandKeys));
    }
    // _setFlag(node, TreeViewNodeFlags.Collapsed, !bool);
  }

  _itemKey(e: TreeViewNode) {
    if (!this.expandedBy) {
      return e.uid;
    }
    if (typeof this.expandedBy === 'string') {
      return e.dataItem[this.expandedBy];
    }
    if (typeof this.expandedBy === 'function') {
      return this.expandedBy(e);
    }
  }

  setExpandKeys(expandKeys: any[]) {
    this.expandKeys = new Set(expandKeys);
  }

  registerEvent() {

  }
}
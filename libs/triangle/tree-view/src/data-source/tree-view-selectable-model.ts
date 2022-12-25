import { isPresent } from '@gradii/nanofn';
import { Subject } from 'rxjs';
import { SelectionMode } from '../selection/selection-mode';
import { TreeViewNode } from './tree-view.data-source.node';

export class TreeViewSelectEvent {
  constructor(public selectedKeys: Set<string>) {
  }
}

export class TreeViewSelectableModel {
  selectedBy: string | ((context: TreeViewNode) => any);

  selectable: boolean;

  selectedKeys: Set<string> = new Set();

  selectedKeysChange: Subject<TreeViewSelectEvent> = new Subject<TreeViewSelectEvent>();

  selectionMode: SelectionMode;

  constructor(/*public treeViewDataSourceModel: TreeViewDataSourceModel*/) {
  }

  selectNode(node: TreeViewNode) {
    if (!this.selectable) {
      return;
    }
    if (this.selectionMode === 'multiple') {
      this._selectMultiple(node);
    } else {
      this._selectSingle(node);
    }
    this.selectedKeysChange.next(new TreeViewSelectEvent(this.selectedKeys));
    // const {enabled, mode}  = this.options;
    // const performSelection = this.selectActions[mode] || noop;
    // if (!enabled) {
    //   return;
    // }
    // performSelection(e);

  }

  _selectSingle(node: any) {
    const key = this._itemKey(node);
    if (!this.selectedKeys.has(key)) {
      this.selectedKeys.clear();
      this.selectedKeys.add(key);
    }
  }

  _selectMultiple(node: any) {
    const key        = this._itemKey(node);
    const isSelected = this.selectedKeys.has(key);
    if (!isPresent(key)) {
      return;
    }
    if (isSelected) {
      this.selectedKeys.delete(key);
    } else {
      this.selectedKeys.add(key);
    }
  }

  // notify(): any {
  //   this.lastChange = Array.from(this.state);
  //   this.selectedKeysChange.emit(this.lastChange);
  // }

  isSelected(node: TreeViewNode) {
    return this.selectedKeys.has(this._itemKey(node));
  }

  _itemKey(e: TreeViewNode) {
    if (!this.selectedBy) {
      return e.uid;
    }
    if (typeof this.selectedBy === 'string') {
      return e.dataItem[this.selectedBy];
    }
    if (typeof this.selectedBy === 'function') {
      return this.selectedBy(e);
    }
  }
}
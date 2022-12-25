import { isPresent } from '@gradii/nanofn';
import { Subject } from 'rxjs';
import { TreeViewNode } from './tree-view.data-source.node';

export class TreeViewDisableModel {
  disableKey: string | ((context: TreeViewNode) => string | number | any) = 'id';

  disabledKeys: Set<string> = new Set();

  disabledKeysChange = new Subject();

  constructor() {
  }

  setDisabledKeys(disabledKeys: string[]) {
    this.disabledKeys = new Set(disabledKeys);
  }

  isDisabled(node: TreeViewNode): boolean {
    return this.disabledKeys.has(this._itemKey(node));
  }

  _itemKey(item: TreeViewNode) {
    if (!isPresent(this.disableKey)) {
      return item.uid;
    }
    if (typeof this.disableKey === 'string' && isPresent(item.dataItem)) {
      return item.dataItem[this.disableKey];
    }
    if (typeof this.disableKey === 'function') {
      return this.disableKey(item);
    }
  }

}
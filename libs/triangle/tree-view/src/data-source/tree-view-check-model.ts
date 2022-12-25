import { isPresent } from '@gradii/nanofn';
import { CheckboxState } from '@gradii/triangle/checkbox';
import { Subject } from 'rxjs';
import { TreeViewNode, TreeViewNodeFlags } from './tree-view.data-source.node';
import { _getFlag, _setFlag, forEachDescendants } from './tree-view.data-source.utils';

export class TreeViewCheckEvent {
  constructor(public checkedKeys: Set<string>) {
  }
}

export class TreeViewCheckModel {

  checkMode: 'multiple' | 'single' = 'multiple';

  checkChildren: boolean = true;

  checkParents: boolean = true;

  checkOnClick: boolean = true;

  public checkedKeys: Set<string> = new Set();

  checkedKeysChange: Subject<TreeViewCheckEvent> = new Subject<TreeViewCheckEvent>();

  constructor() {
  }

  checkedBy: string | ((context: TreeViewNode) => any) = 'id';

  setCheckedKeys(checkedKeys: string[]) {
    this.checkedKeys = new Set(checkedKeys);
  }

  _itemKey(item: TreeViewNode) {
    if (!isPresent(this.checkedBy)) {
      return item.uid;
    }
    if (typeof this.checkedBy === 'string' && isPresent(item.dataItem)) {
      return item.dataItem[this.checkedBy];
    }
    if (typeof this.checkedBy === 'function') {
      return this.checkedBy(item);
    }
  }

  _isItemChecked(dataItem: TreeViewNode, index?: string): boolean {
    // if (!this.checkKey) {
    //   // return this.#isIndexChecked(index);
    // }
    return this.checkedKeys.has(this._itemKey(dataItem));
  }

  checkState(node: TreeViewNode) : CheckboxState {
    if (this.isChecked(node)) {
      return 'checked';
    } else if (this.isIndeterminate(node)) {
      return 'indeterminate';
    } else {
      return 'unchecked';
    }
  }

  isChecked(node: TreeViewNode, index?): boolean {
    return this._isItemChecked(node, index);
  }

  isIndeterminate(node: TreeViewNode) {
    return this.checkMode === 'multiple' && _getFlag(node, TreeViewNodeFlags.Indeterminate);
  }

  setIndeterminate(node: TreeViewNode, bool: boolean) {
    if (this.checkMode === 'multiple') {
      _setFlag(node, TreeViewNodeFlags.Indeterminate, bool);
    }
  }

  toggleCheckNode(node: TreeViewNode) {
    const itemKey = this._itemKey(node);
    this.checkNode(node, !this.checkedKeys.has(itemKey));
  }

  checkNode(node: TreeViewNode, checked?: boolean, noEmit: boolean = false) {
    if (checked === undefined) {
      checked = node.isChecked;
    }
    if (this.checkMode === 'multiple') {
      this._checkMultiple(node, checked);
    } else {
      this._checkSingle(node, checked);
    }
    if (!noEmit) {
      this.checkedKeysChange.next(new TreeViewCheckEvent(this.checkedKeys));
    }
  }

  _checkNode(node: TreeViewNode, checked: boolean) {
    const itemKey = this._itemKey(node);
    this.setIndeterminate(node, false);
    if (!checked) {
      this.checkedKeys.delete(itemKey);
      if (this.checkChildren) {
        forEachDescendants(node, it => {
          if (it.isVisible && !it.isDisabled) {
            this.checkedKeys.delete(this._itemKey(it));
          }
        });
      }
    } else {
      this.checkedKeys.add(itemKey);
      if (this.checkChildren) {
        forEachDescendants(node, it => {
          if (it.isVisible && !it.isDisabled) {
            this.checkedKeys.add(this._itemKey(it));
          }
        });
      }
    }

    if (this.checkParents) {
      this.checkParentNode(node);
    }
  }

  _checkSingle(node: any, checked: boolean) {
    const key = this._itemKey(node.item);
    if (checked) {
      this.checkedKeys.clear();
      this.checkedKeys.add(key);
    } else if (this.checkedKeys.has(key)) {
      this.checkedKeys.clear();
    }
  }

  _checkMultiple(node: TreeViewNode, checked: boolean) {
    this._checkNode(node, checked);
  }

  reCheckNode(node: TreeViewNode) {
    if (node.isChecked) {
      this.checkNode(node, true);
    } else {
      if (node.loadedChildren && node.loadedChildren.length) {
        this.checkParentNode(node.loadedChildren[0]);
      }
    }
  }

  checkParentNode(node: TreeViewNode) {
    while (node.parentNode) {
      node = node.parentNode;

      let checked   = 0;
      let unchecked = 0;
      node.loadedChildren.forEach(it => {
        if (this.checkedKeys.has(this._itemKey(it))) {
          checked++;
        } else {
          unchecked++;
        }
      });
      this.setIndeterminate(node, checked > 0 && unchecked > 0);
      if (checked > 0 && checked === node.loadedChildren.length) {
        this.checkedKeys.add(this._itemKey(node));
      } else {
        this.checkedKeys.delete(this._itemKey(node));
      }
    }
  }

}
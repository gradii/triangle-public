/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { TreeItemLookup } from './tree-item-lookup.interface';
import { TreeItem } from './tree-item.interface';

@Injectable()
export class TreeViewLookupService {
  map: Map<string, TreeItemLookup> = new Map();

  /**
   * @hidden
   */
  constructor() {
  }

  reset() {
    this.map.clear();
  }

  registerItem(item: TreeItem, parent: TreeItem) {
    const currentLookup: TreeItemLookup = {
      children: [],
      item,
      parent: parent ? this.item(parent.uid) : null
    };
    this.map.set(item.uid, currentLookup);
  }

  registerChildren(uid: string, children: TreeItem[]) {
    const item = this.item(uid);
    if (!item) {
      return;
    }
    item.children = children;
  }

  unregisterItem(uid: string, dataItem: any) {
    const current = this.item(uid);
    if (current && current.item.node === dataItem) {
      this.map.delete(uid);
      if (current.parent && current.parent.children) {
        current.parent.children = current.parent.children.filter(
          item => item.node !== dataItem);
      }
    }
  }

  replaceItem(uid: string, item: TreeItem, parent: TreeItem) {
    if (!item) {
      return;
    }
    this.unregisterItem(uid, item.node);
    this.registerItem(item, parent);
    this.addToParent(item, parent);
  }

  itemLookup(uid: string) {
    const item = this.item(uid);
    if (!item) {
      return null;
    }
    return {
      children: this.mapChildren(item.children),
      item: item.item,
      parent: item.parent
    };
  }

  hasItem(uid: string) {
    return this.map.has(uid);
  }

  item(uid: string) {
    return this.map.get(uid) || null;
  }

  addToParent(item, parent): any {
    if (parent) {
      const parentItem = this.item(parent.uid);
      parentItem.children = parentItem.children || [];
      parentItem.children.push(item)
    }
  }

  mapChildren(children = []): any {
    return children.map(c => {
      const { item, parent, children } = this.item(c.uid);
      return {
        children: this.mapChildren(children),
        item,
        parent
      };
    });
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';
import { NavigationItem } from './navigation-item.interface';

export const safe         = node => (node || {});
export const safeChildren = node => (safe(node).children || []);

export const lastVisibleNode = (nodes) => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }
  const nodesCount = nodes.length;
  const lastIndex  = nodesCount - 1;
  for (let index = lastIndex; index >= 0; index -= 1) {
    const node = nodes[index];
    if (node.visible) {
      return node;
    }
  }
  return null;
};

/**
 * @hidden
 */
export class NavigationModel {
  nodes: NavigationItem[] = [];

  constructor() {
  }

  firstVisibleNode(): NavigationItem {
    return (this.nodes || []).find(node => node.visible);
  }

  lastVisibleNode() {
    let node = lastVisibleNode(this.nodes);
    while (isPresent(node) && safeChildren(node).length > 0) {
      const children         = safeChildren(node);
      const lastVisibleChild = lastVisibleNode(children);
      if (!isPresent(lastVisibleChild)) {
        return node;
      }
      node = lastVisibleChild;
    }
    return node;
  }

  closestNode(uid: string) {
    const {prev}  = safe(this.findNode(uid));
    const sibling = prev || this.firstVisibleNode();
    return safe(sibling).index === uid ? this.visibleSibling(sibling, 1) : sibling;
  }

  firstFocusableNode() {
    return this.nodes.find((node) => {
      return !node.disabled && node.visible;
    });
  }

  findNode(uid: string): NavigationItem {
    if (!uid) {
      return;
    }
    return this.find(uid, this.nodes);
  }

  findParent(uid: string): NavigationItem {
    const node = this.findNode(uid);
    if (!node) {
      return null;
    }
    return node.parent;
  }

  findVisibleChild(uid: string) {
    console.log(`find visible child ${uid}`);
    const node     = this.findNode(uid);
    const children = safeChildren(node);
    const child    = children.find((child) => child.visible);
    console.log(child.uid);
    return child;
  }

  findVisiblePrev(item: NavigationItem): NavigationItem {
    const uid             = item.uid;
    const currentNode     = this.findNode(uid);
    const parent          = this.findParent(uid);
    const levelIndex      = this.container(parent).indexOf(currentNode);
    const prevNodes       = this.container(parent).slice(0, levelIndex);
    const prevNodesHidden = prevNodes.every(node => !node.visible);

    if (levelIndex === 0 || prevNodesHidden) {
      return parent;
    }

    let prev = this.visibleSibling(currentNode, -1);
    if (prev) {
      let children = this.container(prev);
      while (children.length > 0 && children.some(node => node.visible)) {
        prev     = lastVisibleNode(children);
        children = this.container(prev);
      }
    }
    return prev;
  }

  findVisibleNext(item: NavigationItem) {
    const children           = this.container(item);
    const hasVisibleChildren = children.some(child => child.visible);
    if (children.length === 0 || !hasVisibleChildren) {
      return this.visibleSibling(item, 1);
    }
    return children.find(child => child.visible);
  }

  registerItem(id: number, uid: string, parentUid: string,
               disabled: boolean,
               loadMoreButton: boolean = false,
               visible: boolean        = true) {
    const children = [];
    const parent   = this.findNode(parentUid);
    const node     = {id, children, uid, parent, disabled, loadMoreButton, visible} as NavigationItem;
    this.insert(node, parent);
  }

  unregisterItem(id: number, uid: string) {
    const node = this.find(uid, this.nodes);
    if (!node || node.id !== id) {
      return;
    }
    const children = this.container(node.parent);
    children.splice(children.indexOf(node), 1);
  }

  container(node): NavigationItem[] {
    return node ? node.children : this.nodes;
  }

  find(uid, nodes): NavigationItem {
    for (const node of nodes) {
      if (node.uid === uid) {
        return node;
      } else if (node.children) {
        const found = this.find(uid, node.children);
        if (found) {
          return found;
        }
      }
    }
  }

  insert(node: NavigationItem, parent: NavigationItem): void {
    const nodes = this.container(parent);
    nodes.push(node);
  }

  visibleSibling(node: NavigationItem, offset): NavigationItem {
    if (!node) {
      return null;
    }
    const parent      = this.findParent(node.uid);
    const container   = this.container(parent);
    let nextItemIndex = container.indexOf(node) + offset;
    let nextItem      = container[nextItemIndex];
    while (isPresent(nextItem)) {
      if (nextItem.visible) {
        return nextItem;
      }
      nextItemIndex += offset;
      nextItem = container[nextItemIndex];
    }
    return this.visibleSibling(parent, offset);
  }
}

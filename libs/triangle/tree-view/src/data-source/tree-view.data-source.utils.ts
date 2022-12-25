import type { TreeViewNode, TreeViewNodeFlags } from './tree-view.data-source.node';

/**
 * traverse descendant tree node
 */
export function forEachDescendants(node: TreeViewNode, visitor?: (node: TreeViewNode) => void | boolean,
                                   postVisit?: (node: TreeViewNode) => void | boolean) {
  if (visitor && visitor(node)) {
    return;
  }
  if (node.loadedChildren) {
    node.loadedChildren.forEach(it => forEachDescendants(it, visitor, postVisit));
  }
  if (postVisit) {
    postVisit(node);
  }
}

export function traverseParent(node: TreeViewNode, visitor?: (node: TreeViewNode) => void) {
  if (visitor) {
    visitor(node);
  }
  if (node.parentNode) {
    traverseParent(node.parentNode, visitor);
  }
}

export function _getFlag(node: TreeViewNode, flag: TreeViewNodeFlags): boolean {
  return (node._flags & flag) != 0;
}

export function _setFlag(node: TreeViewNode, flag: TreeViewNodeFlags, value: boolean, noEmit?: boolean): boolean {
  if (value != _getFlag(node, flag)) {
    node._flags = value ? (node._flags | flag) : (node._flags ^ flag);
    if (!noEmit) {
      // this.onPropertyChanged();
    }
    return true;
  }
  return false;
}
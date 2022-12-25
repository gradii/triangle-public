/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';
import { getter } from '@gradii/nanofn';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { TreeItem } from './tree-item.interface';
import { TreeViewFilterSettings } from './tree-view-filter-settings';

const focusableRegex                   = /^(?:a|input|select|option|textarea|button|object)$/i;
/**
 * @hidden
 */
export const match                     = (element, selector) => {
  const matcher = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
  if (!matcher) {
    return false;
  }
  return matcher.call(element, selector);
};
/**
 * @hidden
 */
export const closestWithMatch          = (element, selector) => {
  if (!document.documentElement.contains(element)) {
    return null;
  }
  let parent = element;
  while (parent !== null && parent.nodeType === 1) {
    if (match(parent, selector)) {
      return parent;
    }
    parent = parent.parentElement || parent.parentNode;
  }
  return null;
};
/**
 * @hidden
 */
export const noop                      = () => {
};
/**
 * @hidden
 */
export const isBlank                   = (value) => value === null || value === undefined;
/**
 * @hidden
 */
export const isArray                   = (value) => Array.isArray(value);
/**
 * @hidden
 */
export const isNullOrEmptyString       = (value) => isBlank(value) || value.trim().length === 0;
/**
 * @hidden
 */
export const isBoolean                 = (value) => typeof value === 'boolean';
/**
 * @hidden
 */
export const closestNode               = (element) => {
  const selector = 'li.tri-tree-view-item';
  if (element.closest) {
    return element.closest(selector);
  } else {
    return closestWithMatch(element, selector);
  }
};
/**
 * @hidden
 */
export const isFocusable               = (element) => {
  if (element.tagName) {
    const tagName  = element.tagName.toLowerCase();
    const tabIndex = element.getAttribute('tabIndex');
    const skipTab  = tabIndex === '-1';
    let focusable  = tabIndex !== null && !skipTab;
    if (focusableRegex.test(tagName)) {
      focusable = !element.disabled && !skipTab;
    }
    return focusable;
  }
  return false;
};
/**
 * @hidden
 */
export const isContent                 = (element) => {
  const scopeSelector = '.tri-tree-view-leaf:not(.tri-tree-view-load-more-button),.tri-tree-view-item,.tri-tree-view';
  let node            = element;
  while (node && !match(node, scopeSelector)) {
    node = node.parentNode;
  }
  if (node) {
    return match(node, '.tri-tree-view-leaf:not(.tri-tree-view-load-more-button)');
  }
};
/**
 * @hidden
 *
 * Returns the nested .tri-tree-view-leaf:not(.tri-tree-view-load-more-button) element.
 * If the passed parent item is itself a content node, it is returned.
 */
export const getContentElement         = (parent) => {
  if (!isPresent(parent)) {
    return null;
  }
  const selector = '.tri-tree-view-leaf:not(.tri-tree-view-load-more-button)';
  if (match(parent, selector)) {
    return parent;
  }
  return parent.querySelector(selector);
};
/**
 * @hidden
 */
export const isLoadMoreButton          = (element) => {
  return isPresent(closestWithMatch(element, '.tri-tree-view-leaf.tri-tree-view-load-more-button'));
};
/**
 * @hidden
 */
export const closest                   = (node, predicate) => {
  while (node && !predicate(node)) {
    node = node.parentNode;
  }
  return node;
};
/**
 * @hidden
 */
export const hasParent                 = (element, container) => {
  return Boolean(closest(element, (node) => node === container));
};
/**
 * @hidden
 */
export const focusableNode             = (element) => element.nativeElement.querySelector('li[tabindex="0"]');
/**
 * @hidden
 */
export const hasActiveNode             = (target, node) => {
  const closestItem = node || closestNode(target);
  return closestItem && (closestItem === target || target.tabIndex < 0);
};
/**
 * @hidden
 */
export const nodeId                    = (node) => node ? node.getAttribute('data-treeuid') : '';
/**
 * @hidden
 * @deprecated
 */
export const nodeIndex                 = (item) => (item || {}).index;
/**
 * @hidden
 */
export const dataItemsEqual            = (first, second) => {
  if (!isPresent(first) && !isPresent(second)) {
    return true;
  }
  return isPresent(first) && isPresent(second) && first.item.dataItem === second.item.dataItem;
};
/**
 * @hidden
 */
export const getDataItem               = (lookup) => {
  if (!isPresent(lookup)) {
    return lookup;
  }
  return lookup.item.dataItem;
};
/**
 * @hidden
 */
export const isArrayWithAtLeastOneItem = v => v && Array.isArray(v) && v.length !== 0;

/**
 * @hidden
 * A recursive tree-filtering algorithm that returns:
 * - all child nodes of matching nodes
 * - a chain parent nodes from the match to the root node
 */
export const filterTree = (items, term, {operator, ignoreCase, mode}: TreeViewFilterSettings, textField, depth = 0) => {
  const field = typeof textField === 'string' ? textField : textField[depth];
  items.forEach((wrapper) => {
    const matcher           = typeof operator === 'string' ? matchByFieldAndCase(field, operator, ignoreCase) : operator;
    const isMatch           = matcher(wrapper.dataItem, term);
    wrapper.isMatch         = isMatch;
    wrapper.visible         = isMatch;
    wrapper.containsMatches = false;
    if (isMatch) {
      setParentChain(wrapper.parent);
    }
    if (wrapper.children && wrapper.children.length > 0) {
      if (mode === 'strict' || !isMatch) {
        filterTree(wrapper.children, term, {operator, ignoreCase, mode}, textField, depth + 1);
      } else {
        makeAllVisible(wrapper.children);
      }
    }
  });
};


export const setParentChain = (node: TreeViewNode) => {
  if (!isPresent(node)) {
    return;
  }
  node.isChildFilterMatch = true;
  node.isVisible = true;
  if (isPresent(node.parentNode) && !node.parentNode.isChildFilterMatch) {
    setParentChain(node.parentNode);
  }
};

export const makeAllVisible = (nodes) => {
  nodes.forEach(node => {
    node.visible = true;
    if (node.children) {
      makeAllVisible(node.children);
    }
  });
};


const operators = {
  contains        : (a, b) => a.indexOf(b) >= 0,
  doesnotcontain  : (a, b) => a.indexOf(b) === -1,
  startswith      : (a, b) => a.lastIndexOf(b, 0) === 0,
  doesnotstartwith: (a, b) => a.lastIndexOf(b, 0) === -1,
  endswith        : (a, b) => a.indexOf(b, a.length - b.length) >= 0,
  doesnotendwith  : (a, b) => a.indexOf(b, a.length - b.length) < 0
};

export const matchByCase = (matcher, ignoreCase) => (a, b) => {
  if (ignoreCase) {
    return matcher(a.toLowerCase(), b.toLowerCase());
  }
  return matcher(a, b);
};

export const matchByFieldAndCase    = (field, operator, ignoreCase) => {
  return (dataItem, term) => {
    return matchByCase(operators[operator], ignoreCase)(getter(dataItem, field), term);
  };
};
/**
 * @hidden
 */
export const buildTreeIndex         = (parentIndex, itemIndex) => {
  return [parentIndex, itemIndex].filter(part => isPresent(part)).join('_');
};
/**
 * @hidden
 */
export const buildTreeItem: (dataItem, currentUid, parentUid) => TreeItem = (dataItem, currentUid, parentUid) => {
  if (!isPresent(dataItem)) {
    return null;
  }
  return {
    node: dataItem,
    uid : buildTreeIndex(parentUid, currentUid)
  } as TreeItem;
};
/**
 * @hidden
 *
 * Retrieves all descendant nodes' lookups which are currently registered in the provided lookup item as a flat array.
 */
export const fetchLoadedDescendants = (lookup, filterExpression) => {
  if (!isPresent(lookup) || lookup.children.length === 0) {
    return [];
  }
  let descendants = lookup.children;
  if (isPresent(filterExpression)) {
    descendants = descendants.filter(filterExpression);
  }
  descendants.forEach(child => descendants = descendants.concat(fetchLoadedDescendants(child, filterExpression)));
  return descendants;
};
/**
 * @hidden
 *
 * Compares two Seets to determine whether all unique elements in one, are present in the other.
 * Important:
 *  - it disregards the element order
 */
export const sameValues             = (as, bs) => {
  if (as.size !== bs.size) {
    return false;
  }
  return Array.from(as).every(v => bs.has(v));
};
/**
 * @hidden
 * Returns the size class based on the component and size input.
 */
export const getSizeClass           = (component, size) => {
  const SIZE_CLASSES = {
    'small' : `tri-${component}-sm`,
    'medium': `tri-${component}-md`,
    'large' : `tri-${component}-lg`
  };
  return SIZE_CLASSES[size];
};

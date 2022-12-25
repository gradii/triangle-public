/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

const focusableRegex = /^(?:a|input|select|option|textarea|button|object)$/i;
const NODE_NAME_PREDICATES = {};

const toClassList = (classNames: string) => String(classNames).trim().split(' ');

/**
 * @hidden
 */
export const hasClasses = (element: HTMLElement, classNames: string): boolean => {
  const namesList = toClassList(classNames);
  return Boolean(toClassList(element.className).find((className) => namesList.indexOf(className) >= 0));
};

/**
 * @hidden
 */
export const matchesClasses = (classNames: string) =>
  (element: HTMLElement): boolean => hasClasses(element, classNames);

/**
 * @hidden
 */
export const matchesNodeName = (nodeName: string) => {
  if (!NODE_NAME_PREDICATES[nodeName]) {
    NODE_NAME_PREDICATES[nodeName] = (element: HTMLElement): boolean =>
      String(element.nodeName).toLowerCase() === nodeName.toLowerCase();
  }

  return NODE_NAME_PREDICATES[nodeName];
};

/**
 * @hidden
 */
export const closest = (node, predicate) => {
  while (node && !predicate(node)) {
    node = node.parentNode;
  }

  return node;
};

/**
 * @hidden
 */
export const closestInScope = (node, predicate, scope) => {
  while (node && node !== scope && !predicate(node)) {
    node = node.parentNode;
  }

  if (node !== scope) {
    return node;
  }
};

/**
 * @hidden
 */
export const contains = (parent, node, matchSelf: boolean = false) => {
  const outside = !closest(node, (child) => child === parent);
  if (outside) {
    return false;
  }

  const el = closest(node, (child) => child === node);
  return el && (matchSelf || el !== parent);
};

/**
 * @hidden
 */
export const isVisible = (element: any): boolean => {
  const rect = element.getBoundingClientRect();
  const hasSize = rect.width > 0 && rect.height > 0;
  const hasPosition = rect.x !== 0 && rect.y !== 0;

  // Elements can have zero size due to styling, but they will still count as visible.
  // For example, the selection checkbox has no size, but is made visible through styling.
  return (hasSize || hasPosition) && window.getComputedStyle(element).visibility !== 'hidden';
};

/**
 * @hidden
 */
export const isFocusable = (element: any, checkVisibility: boolean = true): boolean => {
  if (element.tagName) {
    const tagName = element.tagName.toLowerCase();
    const tabIndex = element.getAttribute('tabIndex');
    const skipTab = tabIndex === '-1';

    let focusable = tabIndex !== null && !skipTab;

    if (focusableRegex.test(tagName)) {
      focusable = !element.disabled && !skipTab;
    }

    return focusable && (!checkVisibility || isVisible(element));
  }
  return false;
};

/**
 * @hidden
 */
export const findElement = (node: any, predicate: (element: any) => boolean, matchSelf: boolean = true): any => {
  if (!node) {
    return;
  }

  if (matchSelf && predicate(node)) {
    return node;
  }

  node = node.firstChild;
  while (node) {
    if (node.nodeType === 1) {
      const element = findElement(node, predicate);

      if (element) {
        return element;
      }
    }

    node = node.nextSibling;
  }
};

/**
 * @hidden
 */
export const findFocusable = (element: any, checkVisibility: boolean = true) => {
  return findElement(element, (node) => isFocusable(node, checkVisibility));
};

/**
 * @hidden
 */
export const findFocusableChild = (element: any, checkVisibility: boolean = true) => {
  return findElement(element, (node) => isFocusable(node, checkVisibility), false);
};

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/* tslint:disable: no-bitwise */

/**
 * @hidden
 */
export const append = (element) => {
  let appended = false;
  return () => {
    if (!appended) {
      document.body.appendChild(element);
      appended = true;
    }
    return element;
  };
};

/**
 * @hidden
 */
const getDocument = element => element.ownerDocument.documentElement;

/**
 * @hidden
 */
const getWindow = element => element.ownerDocument.defaultView;

/**
 * @hidden
 */
export const offset = element => {
  const {clientTop, clientLeft} = getDocument(element);
  const {pageYOffset, pageXOffset} = getWindow(element);
  const {top, left} = element.getBoundingClientRect();

  return {
    top : top + pageYOffset - clientTop,
    left: left + pageXOffset - clientLeft
  };
};

/**
 * @hidden
 * If the target is before the draggable element, returns `true`.
 *
 * DOCUMENT_POSITION_FOLLOWING = 4
 */
export const isTargetBefore = (draggable, target) =>
  (target.compareDocumentPosition(draggable) & 4) !== 0;

/**
 * @hidden
 * If the container and the element are the same
 * or if the container holds (contains) the element, returns `true`.
 *
 * DOCUMENT_POSITION_CONTAINED_BY = 16
 */
export const contains = (element, container) =>
  element === container ||
  (container.compareDocumentPosition(element) & 16) !== 0;

/**
 * @hidden
 */
export const position = (target, before) => {
  const targetRect = offset(target);
  const {offsetWidth, offsetHeight} = target;

  const left = targetRect.left + (before ? 0 : offsetWidth);
  const top = targetRect.top;
  const height = offsetHeight;

  return {left, top, height};
};

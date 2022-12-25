/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AutoScrollHorizontalDirection, AutoScrollVerticalDirection, SCROLL_PROXIMITY_THRESHOLD
} from './enum';

/**
 * Finds the index of an item that matches a predicate function. Used as an equivalent
 * of `Array.prototype.findIndex` which isn't part of the standard Google typings.
 * @param array Array in which to look for matches.
 * @param predicate Function used to determine whether an item is a match.
 */
export function findIndex<T>(array: T[],
                             predicate: (value: T, index: number, obj: T[]) => boolean): number {

  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }

  return -1;
}

/**
 * Increments the vertical scroll position of a node.
 * @param node Node whose scroll position should change.
 * @param amount Amount of pixels that the `node` should be scrolled.
 */
export function incrementVerticalScroll(node: HTMLElement | Window, amount: number) {
  if (node === window) {
    (node as Window).scrollBy(0, amount);
  } else {
    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
    (node as HTMLElement).scrollTop += amount;
  }
}

/**
 * Increments the horizontal scroll position of a node.
 * @param node Node whose scroll position should change.
 * @param amount Amount of pixels that the `node` should be scrolled.
 */
export function incrementHorizontalScroll(node: HTMLElement | Window, amount: number) {
  if (node === window) {
    (node as Window).scrollBy(amount, 0);
  } else {
    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
    (node as HTMLElement).scrollLeft += amount;
  }
}

/**
 * Gets whether the vertical auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerY Position of the user's pointer along the y axis.
 */
export function getVerticalScrollDirection(clientRect: ClientRect, pointerY: number) {
  const {top, bottom, height} = clientRect;
  const yThreshold            = height * SCROLL_PROXIMITY_THRESHOLD;

  if (pointerY >= top - yThreshold && pointerY <= top + yThreshold) {
    return AutoScrollVerticalDirection.UP;
  } else if (pointerY >= bottom - yThreshold && pointerY <= bottom + yThreshold) {
    return AutoScrollVerticalDirection.DOWN;
  }

  return AutoScrollVerticalDirection.NONE;
}

/**
 * Gets whether the horizontal auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerX Position of the user's pointer along the x axis.
 */
export function getHorizontalScrollDirection(clientRect: ClientRect, pointerX: number) {
  const {left, right, width} = clientRect;
  const xThreshold           = width * SCROLL_PROXIMITY_THRESHOLD;

  if (pointerX >= left - xThreshold && pointerX <= left + xThreshold) {
    return AutoScrollHorizontalDirection.LEFT;
  } else if (pointerX >= right - xThreshold && pointerX <= right + xThreshold) {
    return AutoScrollHorizontalDirection.RIGHT;
  }

  return AutoScrollHorizontalDirection.NONE;
}

/**
 * Gets the directions in which an element node should be scrolled,
 * assuming that the user's pointer is already within it scrollable region.
 * @param element Element for which we should calculate the scroll direction.
 * @param clientRect Bounding client rectangle of the element.
 * @param pointerX Position of the user's pointer along the x axis.
 * @param pointerY Position of the user's pointer along the y axis.
 */
export function getElementScrollDirections(element: HTMLElement, clientRect: ClientRect,
                                           pointerX: number,
                                           pointerY: number): [AutoScrollVerticalDirection, AutoScrollHorizontalDirection] {
  const computedVertical        = getVerticalScrollDirection(clientRect, pointerY);
  const computedHorizontal      = getHorizontalScrollDirection(clientRect, pointerX);
  let verticalScrollDirection   = AutoScrollVerticalDirection.NONE;
  let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

  // Note that we here we do some extra checks for whether the element is actually scrollable in
  // a certain direction and we only assign the scroll direction if it is. We do this so that we
  // can allow other elements to be scrolled, if the current element can't be scrolled anymore.
  // This allows us to handle cases where the scroll regions of two scrollable elements overlap.
  if (computedVertical) {
    const scrollTop = element.scrollTop;

    if (computedVertical === AutoScrollVerticalDirection.UP) {
      if (scrollTop > 0) {
        verticalScrollDirection = AutoScrollVerticalDirection.UP;
      }
    } else if (element.scrollHeight - scrollTop > element.clientHeight) {
      verticalScrollDirection = AutoScrollVerticalDirection.DOWN;
    }
  }

  if (computedHorizontal) {
    const scrollLeft = element.scrollLeft;

    if (computedHorizontal === AutoScrollHorizontalDirection.LEFT) {
      if (scrollLeft > 0) {
        horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
      }
    } else if (element.scrollWidth - scrollLeft > element.clientWidth) {
      horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
    }
  }

  return [verticalScrollDirection, horizontalScrollDirection];
}

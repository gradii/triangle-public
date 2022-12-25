/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { TriDropContainer } from '../directives/drop-container';
import { TriResize } from '../directives/resize';

/** Event emitted when the user starts dragging a draggable. */
export interface TriResizeStart<T = any> {
  /** Draggable that emitted the event. */
  source: TriResize<T>;
}

/** Event emitted when the user releases an item, before any animations have started. */
export interface TriResizeRelease<T = any> {
  /** Draggable that emitted the event. */
  source: TriResize<T>;
}

/** Event emitted when the user stops dragging a draggable. */
export interface TriResizeEnd<T = any> {
  /** Draggable that emitted the event. */
  source: TriResize<T>;
  /** Distance in pixels that the user has dragged since the drag sequence started. */
  distance: { x: number, y: number };
  /** Position where the pointer was when the item was dropped */
  dropPoint: { x: number, y: number };
}

/** Event emitted when the user moves an item into a new drop container. */
export interface TriResizeEnter<T = any, I = T> {
  /** Container into which the user has moved the item. */
  container: TriDropContainer<T>;
  /** Item that was moved into the container. */
  item: TriResize<I>;
  /** Index at which the item has entered the container. */
  currentIndex?: number;
}

/**
 * Event emitted when the user removes an item from a
 * drop container by moving it into another one.
 */
export interface TriResizeExit<T = any, I = T> {
  /** Container from which the user has a removed an item. */
  container: TriDropContainer<T>;
  /** Item that was removed from the container. */
  item: TriResize<I>;
}


/** Event emitted when the user drops a draggable item inside a drop container. */
export interface TriResized<T, O = T> {
  /** Index of the item when it was picked up. */
  previousIndex?: number;
  /** Current index of the item. */
  currentIndex?: number;

  positionX?: number;

  positionY?: number;

  /** Position where the pointer was when the item was dropped */
  // dropPoint: { x: number, y: number };

  elementPosition?: { x: number, y: number };

  elementRelativePosition?: { x: number, y: number };

  resizePoint: { x: number, y: number, x2: number, y2: number };
}

/** Event emitted as the user is dragging a draggable item. */
export interface TriResizeMove<T = any> {
  /** Item that is being dragged. */
  source: TriResize<T>;
  /** Position of the user's pointer on the page. */
  pointerPosition: { x: number, y: number };
  /** Native event that is causing the dragging. */
  event: MouseEvent | TouchEvent;
  /** Distance in pixels that the user has dragged since the drag sequence started. */
  distance: { offsetX: number, offsetY: number, offsetX2: number, offsetY2: number };
}

/** Event emitted when the user swaps the position of two drag items. */
export interface TriResizeSortEvent<T = any, I = T> {
  /** Index from which the item was sorted previously. */
  previousIndex: number;
  /** Index that the item is currently in. */
  currentIndex: number;
  /** Container that the item belongs to. */
  container: TriDropContainer<T>;
  /** Item that is being sorted. */
  item: TriResize<I>;
}

export interface TriResizeReposition<T = any, I = T> extends TriResizeSortEvent<T, I> {
  previousPosition: [number, number];
  currentPosition: [number, number];

}

export interface TriResizeRepositionsEvent<T = any, I = T> {
  items: TriResizeReposition<T, I>[];
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { TriDropContainer } from '../directives/drop-container';
import { TriDrag } from '../directives/drag';

/** Event emitted when the user starts dragging a draggable. */
export interface TriDragStart<T = any> {
  /** Draggable that emitted the event. */
  source: TriDrag<T>;
}

/** Event emitted when the user releases an item, before any animations have started. */
export interface TriDragRelease<T = any> {
  /** Draggable that emitted the event. */
  source: TriDrag<T>;
}

/** Event emitted when the user stops dragging a draggable. */
export interface TriDragEnd<T = any> {
  /** Draggable that emitted the event. */
  source: TriDrag<T>;
  /** Distance in pixels that the user has dragged since the drag sequence started. */
  distance: { x: number, y: number };
  /** Position where the pointer was when the item was dropped */
  dropPoint: { x: number, y: number };
}

/** Event emitted when the user moves an item into a new drop container. */
export interface TriDragEnter<T = any, I = T> {
  /** Container into which the user has moved the item. */
  container: TriDropContainer<T>;
  /** Item that was moved into the container. */
  item: TriDrag<I>;
  /** Index at which the item has entered the container. */
  currentIndex?: number;
}

/**
 * Event emitted when the user removes an item from a
 * drop container by moving it into another one.
 */
export interface TriDragExit<T = any, I = T> {
  /** Container from which the user has a removed an item. */
  container: TriDropContainer<T>;
  /** Item that was removed from the container. */
  item: TriDrag<I>;
}


/** Event emitted when the user drops a draggable item inside a drop container. */
export interface TriDragDrop<T, O = T> {
  /** Index of the item when it was picked up. */
  previousIndex?: number;
  /** Current index of the item. */
  currentIndex?: number;

  positionX?: number;

  positionY?: number;
  /** Item that is being dropped. */
  item: TriDrag;
  /** Container in which the item was dropped. */
  container: TriDropContainer<T>;
  /** Container from which the item was picked up. Can be the same as the `container`. */
  previousContainer: TriDropContainer<O>;
  /** Whether the user's pointer was over the container when the item was dropped. */
  isPointerOverContainer: boolean;
  /** Distance in pixels that the user has dragged since the drag sequence started. */
  distance: { x: number, y: number };
  /** Position where the pointer was when the item was dropped */
  dropPoint: { x: number, y: number };

  elementPosition?: { x: number, y: number };

  elementRelativePosition?: { x: number, y: number };
}

/** Event emitted as the user is dragging a draggable item. */
export interface TriDragMove<T = any> {
  /** Item that is being dragged. */
  source: TriDrag<T>;
  /** Position of the user's pointer on the page. */
  pointerPosition: { x: number, y: number };
  /** Native event that is causing the dragging. */
  event: MouseEvent | TouchEvent;
  /** Distance in pixels that the user has dragged since the drag sequence started. */
  distance: { x: number, y: number };
  /**
   * Indicates the direction in which the user is dragging the element along each axis.
   * `1` means that the position is increasing (e.g. the user is moving to the right or downwards),
   * whereas `-1` means that it's decreasing (they're moving to the left or upwards). `0` means
   * that the position hasn't changed.
   */
  delta: { x: -1 | 0 | 1, y: -1 | 0 | 1 };
}

/** Event emitted when the user swaps the position of two drag items. */
export interface TriDragSortEvent<T = any, I = T> {
  /** Index from which the item was sorted previously. */
  previousIndex: number;
  /** Index that the item is currently in. */
  currentIndex: number;
  /** Container that the item belongs to. */
  container: TriDropContainer<T>;
  /** Item that is being sorted. */
  item: TriDrag<I>;
}

export interface TriDragReposition<T = any, I = T> extends TriDragSortEvent<T, I> {
  previousPosition: [number, number];
  currentPosition: [number, number];

}

export interface TriDragRepositionsEvent<T = any, I = T> {
  items: TriDragReposition<T, I>[];
}

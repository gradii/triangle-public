/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DragRefInternal as DragRef } from './drag-drop-ref/drag-ref';

/**
 * Entry in the position cache for draggable items.
 * @docs-private
 */
export interface CachedItemPosition {
  /** Instance of the drag item. */
  drag: DragRef;
  /** Dimensions of the item. */
  clientRect: ClientRect;

  mainAxisLine?: number;

  /**
   * Amount by which the item has been moved since dragging started.
   * drop list only use offsetX as offset
   */
  offsetX: number;

  offsetY?: number;

  /** Inline transform that the drag item had when dragging started. */
  initialTransform: string;
}

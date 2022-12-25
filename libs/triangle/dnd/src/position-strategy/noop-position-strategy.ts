/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';
import { DragRefInternal as DragRef } from '../drag-drop-ref/drag-ref';
import { DragDropRegistry } from '../drag-drop-registry';
import { CachedItemPosition } from '../drop-container.interface';
import { PositionStrategy } from './position-strategy';

export class NoopPositionStrategy implements PositionStrategy {

  _itemPositions: CachedItemPosition[] = [];

  public dropContainerRef: DndContainerRef;

  constructor(public _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>) {
  }

  _sortItem(item: DragRef, pointerX: number, pointerY: number,
            pointerDelta: { x: number; y: number; }): void {
    throw new Error('Method not implemented.');
  }

  _getItemIndexFromPointerPosition(item: DragRef, pointerX: number, pointerY: number): number {
    return -1;
  }

  _cacheItemPositions(): void {
  }

  _findItemIndex(item: DragRef): number {
    return -1;
  }

  adjustItemPositions(cb: (clientRect: ClientRect) => void): void {
  }

  repositionDraggingItem(): void {
  }

  dispose(): void {
  }

  reset(): void {
  }

}

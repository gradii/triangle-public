/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriDropGridContainer } from '../directives/drop-grid-container';
import { TriDragGridItemComponent } from '../drag-grid/drag-grid-item.component';
import { CachedItemPosition } from '../drop-container.interface';
import { DndContainerRef, } from '../drag-drop-ref/dnd-container-ref';
import { DragRefInternal as DragRef } from '../drag-drop-ref/drag-ref';
import { DropGridContainerRef } from '../drag-drop-ref/drop-grid-container-ref';
import { DragDropRegistry } from '../drag-drop-registry';
import { PositionStrategy } from './position-strategy';

export class GridPositionStrategy implements PositionStrategy {

  _itemPositions: CachedItemPosition[] = [];

  public dropContainerRef: DropGridContainerRef;

  constructor(
    public _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>
  ) {
  }

  latestPositionX: number = -1;
  latestPositionY: number = -1;

  _rollbackItem(item: DragRef, rollbackX: number, rollbackY: number) {
    const placeholderRef = item.getPlaceholderElement();

    const posX = rollbackX;
    const posY = rollbackY;

    this.latestPositionX = posX;
    this.latestPositionY = posY;

    (item.data as unknown as TriDragGridItemComponent).renderX = posX;
    (item.data as unknown as TriDragGridItemComponent).renderY = posY;

    const transformX = posX * this.dropContainerRef._currentTileWidth + this.dropContainerRef._columnGap;
    const transformY = posY * this.dropContainerRef._currentTileHeight + this.dropContainerRef._rowGap;

    placeholderRef.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
    return;
  }

  _sortItem(item: DragRef, elementPointX: number, elementPointY: number,
            pointerDelta: { x: number; y: number; }): void {

    const positionX = Math.min(this.pixelsToPositionX(item, elementPointX),
      (this.dropContainerRef.data as unknown as TriDropGridContainer).maxCols - item.data.renderCols);
    const positionY = Math.min(this.pixelsToPositionY(item, elementPointY),
      (this.dropContainerRef.data as unknown as TriDropGridContainer).maxRows - item.data.renderRows);

    const placeholderRef = item.getPlaceholderElement();

    const maxColumns                   = Math.max(
      positionX + 1,
      (this.dropContainerRef.data as unknown as TriDropGridContainer).renderCols,
      this.dropContainerRef.lastDragCols);
    const maxRows                      = Math.max(
      positionY + 1,
      (this.dropContainerRef.data as unknown as TriDropGridContainer).renderRows,
      this.dropContainerRef.lastDragRows);
    this.dropContainerRef.lastDragCols = maxColumns;
    this.dropContainerRef.lastDragRows = maxRows;

    let contentWidth, contentHeight;
    if (!this.dropContainerRef._hasPadding) {
      contentWidth  = maxColumns * this.dropContainerRef._currentTileWidth - this.dropContainerRef._columnGap;
      contentHeight = maxRows * this.dropContainerRef._currentTileHeight - this.dropContainerRef._rowGap;
    } else { // todo implement padding
      contentWidth  = maxColumns * this.dropContainerRef._currentTileWidth + this.dropContainerRef._columnGap;
      contentHeight = maxRows * this.dropContainerRef._currentTileHeight + this.dropContainerRef._rowGap;
    }

    (this.dropContainerRef.data as unknown as TriDropGridContainer).contentElement.nativeElement.style.width  = `${contentWidth}px`;
    (this.dropContainerRef.data as unknown as TriDropGridContainer).contentElement.nativeElement.style.height = `${contentHeight}px`;

    // let x, y;
    // if (!this.dropContainerRef.hasPadding) {
    //   x = positionX * this.dropContainerRef.currentColumnWidth;
    //   y = positionY * this.dropContainerRef.currentRowHeight;
    // } else {
    const x = positionX * this.dropContainerRef._currentTileWidth + this.dropContainerRef._columnGap;
    const y = positionY * this.dropContainerRef._currentTileHeight + this.dropContainerRef._rowGap;
    // }

    // this.width  = this.cols * currentColumnWidth - container.gutter;
    // this.height = this.rows * currentColumnHeight - container.gutter;

    (item.data as unknown as TriDragGridItemComponent).renderX = positionX;
    (item.data as unknown as TriDragGridItemComponent).renderY = positionY;

    if (!(this.dropContainerRef.data as unknown as TriDropGridContainer)
      .checkCollision(item.data)) {
      this.latestPositionX = positionX;
      this.latestPositionY = positionY;

      placeholderRef.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }


    // this.pushService._pushItem(item, (this.data as unknown as TriDropGridContainer), positionX, positionY,
    //   pointerDelta);
  }

  _getItemIndexFromPointerPosition(item: DragRef, pointerX: number, pointerY: number): number {
    return -1;
  }

  pixelsToPositionX(item: DragRef, pointerX: number) {
    const ref        = this.dropContainerRef;
    const left       = ref._clientRect.left;
    const scrollLeft = (ref.element as HTMLElement).scrollLeft;
    if (ref._hasPadding) {
      return Math.round((pointerX - left + scrollLeft - ref._columnGap / 2) / ref._currentTileWidth);
    } else {
      return Math.round((pointerX - left + scrollLeft + ref._rowGap / 2) / ref._currentTileWidth);
    }
  }

  pixelsToPositionY(item: DragRef, pointerY: number) {
    const ref       = this.dropContainerRef;
    const top       = ref._clientRect.top;
    const scrollTop = (ref.element as HTMLElement).scrollTop;
    if (ref._hasPadding) {
      return Math.round((pointerY - top + scrollTop - ref._columnGap / 2) / ref._currentTileHeight);
    } else {
      return Math.round((pointerY - top + scrollTop + ref._rowGap / 2) / ref._currentTileHeight);
    }
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

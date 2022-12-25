/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriDropGridContainer } from '../directives/drop-grid-container';
import { DragRef } from '../drag-drop-ref/drag-ref';
import { DropGridContainerRef } from '../drag-drop-ref/drop-grid-container-ref';
import { TriDragGridItemComponent } from './drag-grid-item.component';

export class GridSwapService {
  private swapedItem: TriDragGridItemComponent | undefined;

  constructor(private dropGridContainerRef: DropGridContainerRef) {
  }

  // destroy(): void {
  //   // this.grid = this.gridsterItem = this.swapedItem = null!;
  // }

  swapItem(item: DragRef): void {
    if ((this.dropGridContainerRef.data as TriDropGridContainer).swapItem) {
      this.checkSwapBack(item);
      this.checkSwap(item);
    }
  }

  checkSwapBack(item: DragRef): void {
    if (this.swapedItem) {
      const x: number         = this.swapedItem.renderX;
      const y: number         = this.swapedItem.renderY;
      this.swapedItem.renderX = this.swapedItem.x || 0;
      this.swapedItem.renderY = this.swapedItem.y || 0;
      if ((this.dropGridContainerRef.data as TriDropGridContainer)
        .checkCollision(this.swapedItem)) {
        this.swapedItem.renderX = x;
        this.swapedItem.renderY = y;
      } else {
        this.swapedItem.setSize();
        item.data.renderX = item.data.x || 0;
        item.data.renderY = item.data.y || 0;
        this.swapedItem   = undefined;
      }
    }
  }

  restoreSwapItem(): void {
    if (this.swapedItem) {
      this.swapedItem.renderX = this.swapedItem.x || 0;
      this.swapedItem.renderY = this.swapedItem.y || 0;
      this.swapedItem.setSize();
      this.swapedItem         = undefined;
    }
  }

  setSwapItem(): void {
    if (this.swapedItem) {
      this.swapedItem.checkItemChanges(
        this.swapedItem
      );
      this.swapedItem = undefined;
    }
  }

  checkSwap(item: DragRef): void {
    let gridsterItemCollision;
    if ((this.dropGridContainerRef.data as TriDropGridContainer).swapWhileDragging) {
      gridsterItemCollision = (this.dropGridContainerRef.data as TriDropGridContainer)
        .checkCollisionForSwaping(item.data);
    } else {
      gridsterItemCollision = (this.dropGridContainerRef.data as TriDropGridContainer)
        .checkCollision(item.data);
    }
    if (
      gridsterItemCollision &&
      gridsterItemCollision !== true /*&&
      gridsterItemCollision.canBeDragged()*/
    ) {
      const gridsterItemCollide: TriDragGridItemComponent =
              gridsterItemCollision;
      const copyCollisionX                                = gridsterItemCollide.renderX;
      const copyCollisionY                                = gridsterItemCollide.renderY;
      const copyX                                         = item.data.renderX;
      const copyY                                         = item.data.renderY;
      const diffX                                         = copyX - copyCollisionX;
      const diffY                                         = copyY - copyCollisionY;
      gridsterItemCollide.renderX                         = item.data.x - diffX;
      gridsterItemCollide.renderY                         = item.data.y - diffY;
      item.data.renderX                                   = gridsterItemCollide.x + diffX;
      item.data.renderY                                   = gridsterItemCollide.y + diffY;
      if (
        (this.dropGridContainerRef.data as TriDropGridContainer)
          .checkCollision(gridsterItemCollide) ||
        (this.dropGridContainerRef.data as TriDropGridContainer).checkCollision(item.data)
      ) {
        item.data.renderX           = copyX;
        item.data.renderY           = copyY;
        gridsterItemCollide.renderX = copyCollisionX;
        gridsterItemCollide.renderY = copyCollisionY;
      } else {
        gridsterItemCollide.setSize();
        this.swapedItem = gridsterItemCollide;
        if ((this.dropGridContainerRef.data as TriDropGridContainer).swapWhileDragging) {
          item.data.checkItemChanges(
            item.data
          );
          this.setSwapItem();
        }
      }
    }
  }
}

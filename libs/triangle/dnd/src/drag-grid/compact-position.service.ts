/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriDropGridContainer } from '../directives/drop-grid-container';
import { CompactType } from '../enum';
import { TriDragGridItemComponent } from './drag-grid-item.component';

export class CompactPositionService {
  constructor(private grid: TriDropGridContainer) {
  }

  destroy(): void {
    this.grid = null!;
  }

  checkCompact(compactType: CompactType): void {
    if (compactType !== CompactType.None) {
      if (compactType === CompactType.CompactUp) {
        this.checkCompactMovement('y', -1);
      } else if (
        compactType === CompactType.CompactLeft
      ) {
        this.checkCompactMovement('x', -1);
      } else if (
        compactType === CompactType.CompactUpAndLeft
      ) {
        this.checkCompactMovement('y', -1);
        this.checkCompactMovement('x', -1);
      } else if (
        compactType === CompactType.CompactLeftAndUp
      ) {
        this.checkCompactMovement('x', -1);
        this.checkCompactMovement('y', -1);
      } else if (
        compactType === CompactType.CompactRight
      ) {
        this.checkCompactMovement('x', 1);
      } else if (
        compactType === CompactType.CompactUpAndRight
      ) {
        this.checkCompactMovement('y', -1);
        this.checkCompactMovement('x', 1);
      } else if (
        compactType === CompactType.CompactRightAndUp
      ) {
        this.checkCompactMovement('x', 1);
        this.checkCompactMovement('y', -1);
      } else if (
        compactType === CompactType.CompactDown
      ) {
        this.checkCompactMovement('y', 1);
      } else if (
        compactType === CompactType.CompactDownAndLeft
      ) {
        this.checkCompactMovement('y', 1);
        this.checkCompactMovement('x', -1);
      } else if (
        compactType === CompactType.CompactDownAndRight
      ) {
        this.checkCompactMovement('y', 1);
        this.checkCompactMovement('x', 1);
      } else if (
        compactType === CompactType.CompactLeftAndDown
      ) {
        this.checkCompactMovement('x', -1);
        this.checkCompactMovement('y', 1);
      } else if (
        compactType === CompactType.CompactRightAndDown
      ) {
        this.checkCompactMovement('x', 1);
        this.checkCompactMovement('y', 1);
      }
    }
  }

  checkCompactItem(compactType: CompactType, item: TriDragGridItemComponent): void {
    if (compactType !== CompactType.None) {
      if (compactType === CompactType.CompactUp) {
        this.moveTillCollision(item, 'y', -1);
      } else if (
        compactType === CompactType.CompactLeft
      ) {
        this.moveTillCollision(item, 'x', -1);
      } else if (
        compactType === CompactType.CompactUpAndLeft
      ) {
        this.moveTillCollision(item, 'y', -1);
        this.moveTillCollision(item, 'x', -1);
      } else if (
        compactType === CompactType.CompactLeftAndUp
      ) {
        this.moveTillCollision(item, 'x', -1);
        this.moveTillCollision(item, 'y', -1);
      } else if (
        compactType === CompactType.CompactUpAndRight
      ) {
        this.moveTillCollision(item, 'y', -1);
        this.moveTillCollision(item, 'x', 1);
      } else if (
        compactType === CompactType.CompactDown
      ) {
        this.moveTillCollision(item, 'y', 1);
      } else if (
        compactType === CompactType.CompactDownAndLeft
      ) {
        this.moveTillCollision(item, 'y', 1);
        this.moveTillCollision(item, 'x', -1);
      } else if (
        compactType === CompactType.CompactLeftAndDown
      ) {
        this.moveTillCollision(item, 'x', -1);
        this.moveTillCollision(item, 'y', 1);
      } else if (
        compactType === CompactType.CompactDownAndRight
      ) {
        this.moveTillCollision(item, 'y', 1);
        this.moveTillCollision(item, 'x', 1);
      } else if (
        compactType === CompactType.CompactRightAndDown
      ) {
        this.moveTillCollision(item, 'x', 1);
        this.moveTillCollision(item, 'y', 1);
      }
    }
  }

  private checkCompactMovement(direction: 'x' | 'y', delta: number): void {
    let widgetMoved = false;
    this.grid.getUnSortedItems().forEach((widget: TriDragGridItemComponent) => {
      if (widget.compactEnabled !== false) {
        const moved = this.moveTillCollision(widget, direction, delta);
        if (moved) {
          widgetMoved = true;
          // if (direction === 'x') {
          //   widget.x = widget.renderX;
          // } else {
          //   widget.y = widget.renderY;
          // }
          // widget.itemChanged();
        }
      }
    });
    if (widgetMoved) {
      this.checkCompact(this.grid.compactType);
    }
  }

  private moveTillCollision(
    item: TriDragGridItemComponent,
    direction: 'x' | 'y',
    delta: number
  ): boolean {
    if (direction === 'x') {
      item.renderX += delta;
    } else {
      item.renderY += delta;
    }
    if (this.grid.checkCollision(item)) {
      if (direction === 'x') {
        item.renderX -= delta;
      } else {
        item.renderY -= delta;
      }
      return false;
    } else {
      this.moveTillCollision(item, direction, delta);
      return true;
    }
  }
}

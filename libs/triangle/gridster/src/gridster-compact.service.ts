/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CompactType } from './gridster-config.interface';
import { GridsterItem, GridsterItemComponentInterface } from './gridster-item.interface';
import { GridsterComponentInterface } from './gridster.interface';

export class GridsterCompact {

  constructor(private gridster: GridsterComponentInterface) {
  }

  destroy(): void {
    // @ts-ignore
    delete this.gridster;
  }

  checkCompact(): void {
    if (this.gridster.$options.compactType !== CompactType.None) {
      if (this.gridster.$options.compactType === CompactType.CompactUp) {
        this.checkCompactMovement('y', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeft) {
        this.checkCompactMovement('x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactUpAndLeft) {
        this.checkCompactMovement('y', -1);
        this.checkCompactMovement('x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndUp) {
        this.checkCompactMovement('x', -1);
        this.checkCompactMovement('y', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactRight) {
        this.checkCompactMovement('x', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactUpAndRight) {
        this.checkCompactMovement('y', -1);
        this.checkCompactMovement('x', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactRightAndUp) {
        this.checkCompactMovement('x', 1);
        this.checkCompactMovement('y', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDown) {
        this.checkCompactMovement('y', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDownAndLeft) {
        this.checkCompactMovement('y', 1);
        this.checkCompactMovement('x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDownAndRight) {
        this.checkCompactMovement('y', 1);
        this.checkCompactMovement('x', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndDown) {
        this.checkCompactMovement('x', -1);
        this.checkCompactMovement('y', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactRightAndDown) {
        this.checkCompactMovement('x', 1);
        this.checkCompactMovement('y', 1);
      }
    }
  }

  checkCompactItem(item: GridsterItem): void {
    if (this.gridster.$options.compactType !== CompactType.None) {
      if (this.gridster.$options.compactType === CompactType.CompactUp) {
        this.moveTillCollision(item, 'y', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeft) {
        this.moveTillCollision(item, 'x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactUpAndLeft) {
        this.moveTillCollision(item, 'y', -1);
        this.moveTillCollision(item, 'x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndUp) {
        this.moveTillCollision(item, 'x', -1);
        this.moveTillCollision(item, 'y', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactUpAndRight) {
        this.moveTillCollision(item, 'y', -1);
        this.moveTillCollision(item, 'x', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDown) {
        this.moveTillCollision(item, 'y', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDownAndLeft) {
        this.moveTillCollision(item, 'y', 1);
        this.moveTillCollision(item, 'x', -1);
      } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndDown) {
        this.moveTillCollision(item, 'x', -1);
        this.moveTillCollision(item, 'y', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactDownAndRight) {
        this.moveTillCollision(item, 'y', 1);
        this.moveTillCollision(item, 'x', 1);
      } else if (this.gridster.$options.compactType === CompactType.CompactRightAndDown) {
        this.moveTillCollision(item, 'x', 1);
        this.moveTillCollision(item, 'y', 1);
      }
    }
  }

  private getSortedItems(direction: string): GridsterItemComponentInterface[] {
    return this.gridster.grid.sort(
      (a: GridsterItemComponentInterface, b: GridsterItemComponentInterface) => {
        if (direction == 'yx') {
          if (a.$item.x == b.$item.x) {
            return a.$item.y > b.$item.y ? 1 : -1;
          } else {
            return a.$item.x > b.$item.x ? 1 : -1;
          }
        } else {
          if (a.$item.y == b.$item.y) {
            return a.$item.x > b.$item.x ? 1 : -1;
          } else {
            return a.$item.y > b.$item.y ? 1 : -1;
          }
        }
      });
  }

  private checkCompactMovement(direction: 'x' | 'y', delta: number): void {
    let widgetMoved = false;
    if (direction == 'y') {
      const sorted            = this.getSortedItems('xy');
      const heightMap: number[] = [];
      const fn                = (prev: number[], item: GridsterItemComponentInterface) => {
        const blockWidth  = item.$item.cols;
        const blockHeight = item.$item.rows;
        const start       = item.$item.x, end = item.$item.x + blockWidth;

        let currentHeight;
        const initHeight = delta == -1 ? 0 : -this.gridster.$options.maxCols;
        if (end > heightMap.length) {
          heightMap.fill(initHeight, heightMap.length, heightMap.length = end);
        }
        currentHeight = -delta * Math.max(initHeight, ...heightMap.slice(start, end));
        // if(low)
        if (delta == -1) {
          if (item.$item.y != currentHeight) {
            item.$item.y = currentHeight;
            widgetMoved  = true;
          }
        } else {
          if (item.$item.y + blockHeight != currentHeight) {
            item.$item.y = currentHeight - blockHeight;
            widgetMoved  = true;
          }
        }
        heightMap.fill(-delta * currentHeight + blockHeight, start, end);
        return heightMap;
      };
      delta == -1 ? sorted.reduce(fn, heightMap) : sorted.reduceRight(fn, heightMap);
    } else {
      const sorted            = this.getSortedItems('yx');
      const heightMap: number[] = [];
      sorted.forEach(item => {
        const blockWidth  = item.$item.rows;
        const blockHeight = item.$item.cols;
        const start       = item.$item.y, end = item.$item.y + blockWidth;
        if (end > heightMap.length) {
          heightMap.fill(0, heightMap.length, heightMap.length = end);
        }
        const max = Math.max(0, ...heightMap.slice(start, end));
        // if(low)
        if (item.$item.x != max) {
          item.$item.x = max;
          widgetMoved  = true;
        }
        heightMap.fill(max + blockHeight, start, end);
      });
    }

    // let widgetMoved = false;
    // this.gridster.grid.forEach((widget: GridsterItemComponentInterface) => {
    //   if (widget.$item.compactEnabled !== false) {
    //     const moved = this.moveTillCollision(widget.$item, direction, delta);
    //     if (moved) {
    //       widgetMoved            = true;
    //       widget.item[direction] = widget.$item[direction];
    //       widget.itemChanged();
    //     }
    //   }
    // });
    // if (widgetMoved) {
    //   this.checkCompact();
    // }
  }

  private moveTillCollision(item: GridsterItem, direction: 'x' | 'y', delta: number): boolean {
    item[direction] += delta;
    if (this.gridster.checkCollision(item)) {
      item[direction] -= delta;
      return false;
    } else {
      this.moveTillCollision(item, direction, delta);
      return true;
    }
  }
}

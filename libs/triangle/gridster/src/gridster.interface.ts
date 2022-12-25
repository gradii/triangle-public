/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { GridsterConfigS } from './gridster-configs.interface';
import { ChangeDetectorRef, NgZone, Renderer2 } from '@angular/core';
import { GridsterEmptyCell } from './gridster-empty-cell.service';
import { GridsterCompact } from './gridster-compact.service';
import { GridsterConfig } from './gridster-config.interface';
import { GridsterItem, GridsterItemComponentInterface } from './gridster-item.interface';
import { GridsterRenderer } from './gridster-renderer.service';

export abstract class GridsterComponentInterface {
  $options: GridsterConfigS;
  grid: GridsterItemComponentInterface[];
  checkCollision: (item: GridsterItem) => GridsterItemComponentInterface | boolean;
  checkCollisionForSwapping: (item: GridsterItem) => GridsterItemComponentInterface | boolean;
  positionXToPixels: (x: number) => number;
  pixelsToPositionX: (x: number, roundingMethod: (x: number) => number,
                      noLimit?: boolean) => number;
  positionYToPixels: (y: number) => number;
  pixelsToPositionY: (y: number, roundingMethod: (x: number) => number,
                      noLimit?: boolean) => number;
  findItemWithItem: (item: GridsterItem) => GridsterItemComponentInterface | boolean;
  findItemsWithItem: (item: GridsterItem) => GridsterItemComponentInterface[];
  checkGridCollision: (item: GridsterItem) => boolean;
  checkCollisionTwoItems: (item: GridsterItem, item2: GridsterItem) => boolean;
  getItemComponent: (item: GridsterItem) => GridsterItemComponentInterface | undefined;
  el: HTMLElement;
  renderer: Renderer2;
  gridRenderer: GridsterRenderer;
  cdRef: ChangeDetectorRef;
  options: GridsterConfig;
  calculateLayoutDebounce: () => void;
  updateGrid: () => void;
  movingItem: GridsterItem | null;
  addItem: (item: GridsterItemComponentInterface) => void;
  removeItem: (item: GridsterItemComponentInterface) => void;
  previewStyle: (drag?: boolean) => void;
  mobile: boolean;
  curWidth: number;
  curHeight: number;
  columns: number;
  rows: number;
  curColWidth: number;
  curRowHeight: number;
  windowResize: (() => void) | null;
  setGridDimensions: (() => void);
  dragInProgress: boolean;
  emptyCell: GridsterEmptyCell;
  compact: GridsterCompact;
  zone: NgZone;
  gridRows: Array<number>;
  gridColumns: Array<number>;
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, QueryList } from '@angular/core';
import { ColumnBase } from './column-base';
import { isColumnGroupComponent } from './column-group.component';

const reset = function (...lists) {
  let diff = false;
  lists.forEach((item, i) => {
    const list = item[0];
    const columns = item[1];
    list.reset(columns);
    diff = diff || list.length !== columns.length;
  });
  return diff;
};

export class ColumnsContainer {
  allColumns: QueryList<ColumnBase>;
  leafColumns: QueryList<ColumnBase>;
  lockedColumns: QueryList<ColumnBase>;
  nonLockedColumns: QueryList<ColumnBase>;
  lockedLeafColumns: QueryList<ColumnBase>;
  nonLockedLeafColumns: QueryList<ColumnBase>;
  totalLevels: number;
  changes: EventEmitter<any>;
  private columns;

  constructor(columns: Function) {
    this.columns = columns;
    this.allColumns = new QueryList<ColumnBase>();
    this.leafColumns = new QueryList<ColumnBase>();
    this.lockedColumns = new QueryList<ColumnBase>();
    this.nonLockedColumns = new QueryList<ColumnBase>();
    this.lockedLeafColumns = new QueryList<ColumnBase>();
    this.nonLockedLeafColumns = new QueryList<ColumnBase>();
    this.totalLevels = 0;
    this.changes = new EventEmitter();
  }

  refresh(): void {
    const _this = this;
    const currentLevels = this.totalLevels;
    const leafColumns = [];
    const lockedLeafColumns = [];
    const nonLockedLeafColumns = [];
    const lockedColumns = [];
    const nonLockedColumns = [];
    const allColumns = [];
    this.totalLevels = 0;
    this.columns().forEach(column => {
      const containerLeafColumns = column.isLocked === true ? lockedLeafColumns : nonLockedLeafColumns;
      const containerColumns = column.isLocked === true ? lockedColumns : nonLockedColumns;
      if (!isColumnGroupComponent(column)) {
        containerLeafColumns.push(column);
        leafColumns.push(column);
      }
      containerColumns.push(column);
      allColumns.push(column);
      _this.totalLevels = column.level > _this.totalLevels ? column.level : _this.totalLevels;
    });
    const changes =
            reset(
              [this.leafColumns, leafColumns],
              [this.lockedLeafColumns, lockedLeafColumns],
              [this.nonLockedLeafColumns, nonLockedLeafColumns],
              [this.lockedColumns, lockedColumns],
              [this.allColumns, allColumns],
              [this.nonLockedColumns, nonLockedColumns]
            ) || currentLevels !== this.totalLevels;
    if (changes) {
      this.changes.emit();
    }
  }
}

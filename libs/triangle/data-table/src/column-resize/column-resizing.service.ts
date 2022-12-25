/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';

import { zip } from 'rxjs';
import { take } from 'rxjs/operators';

import { ColumnBase } from '../columns/column-base';
import { leafColumns } from '../helper/column-common';

import { AutoFitFn, ColumnResizeAction, ColumnResizeArgs } from './column-resize.interface';

/**
 * @hidden
 */
const isLocked = column => column.parent ? isLocked(column.parent) : !!column.locked;

/**
 * @hidden
 */
const resizeArgs = (column, extra) => Object.assign({
  columns: leafColumns([column]),
  locked : isLocked(column)
}, extra); // tslint:disable-line:align

/**
 * @hidden
 */
@Injectable()
export class ColumnResizingService {
  changes: EventEmitter<ColumnResizeAction> = new EventEmitter<ColumnResizeAction>();

  private column: ColumnBase;
  private resizedColumns: Array<ColumnResizeArgs>;
  private tables: Array<AutoFitFn> = new Array<AutoFitFn>();
  private muteEndNotification: boolean = false;

  start(column: ColumnBase): void {

    this.trackColumns(column);

    const columns = (this.column.isColumnGroup ? [column] : [])
      .concat(leafColumns([column]));

    this.changes.emit({
      columns: columns,
      locked : isLocked(this.column),
      type   : 'start'
    });
  }

  resizeColumns(deltaPercent: number): void {
    const action = resizeArgs(
      this.column, {
        deltaPercent,
        type: 'resizeColumn'
      });

    this.changes.emit(action);
  }

  resizeTable(delta: number): void {
    const action = resizeArgs(
      this.column, {
        delta,
        type: 'resizeTable'
      });

    this.changes.emit(action);
  }

  resizedColumn(state: ColumnResizeArgs): void {
    this.resizedColumns.push(state);
  }

  end(): void {
    this.changes.emit({
      columns       : [],
      resizedColumns: this.resizedColumns,
      type          : 'end'
    });
  }

  registerTable(fn: AutoFitFn): Function {
    this.tables.push(fn);

    return () => {
      this.tables.splice(this.tables.indexOf(fn), 1);
    };
  }

  measureColumns(info: Array<any>): void {
    const observables = this.tables.map(fn => fn(info));

    zip(...observables)
      .pipe(take(1))
      .subscribe(widths => {
        this.changes.emit({
          columns: info.map(i => i.column),
          type   : 'autoFitComplete',
          widths
        });

        if (!this.muteEndNotification) {
          this.end();
        }

        this.muteEndNotification = false;
      });
  }

  autoFit(column: ColumnBase): void {
    this.muteEndNotification = true;

    this.start(column);

    this.changes.emit({
      columns: [column],
      type   : 'triggerAutoFit'
    });
  }

  private trackColumns(column: ColumnBase): void {
    this.resizedColumns = [];

    this.column = column;
  }
}

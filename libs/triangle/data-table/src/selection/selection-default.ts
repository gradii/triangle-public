/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { isFunction, isPresent, isString } from '@gradii/triangle/util';
import { Subscription } from 'rxjs';
import { DataTableComponent } from '../data-table.component';
import { RowArgs } from '../row-class';

@Directive()
export class Selection {
  /**
   * Defines the collection that will store the selected item keys.
   */
  @Input() selectedKeys: any[] = [];

  /**
   * Defines the item key that will be stored in the `selectedKeys` collection.
   */
  @Input('selectedBy') selectedBy: string | ((context: RowArgs) => any);

  /**
   * Fires when the `selectedKeys` collection has been updated.
   */
  @Output() selectedKeysChange: EventEmitter<any[]> = new EventEmitter();
  protected selectionChangeSubscription: Subscription;

  constructor(protected grid: DataTableComponent) {
    this.init();
  }

  init() {
    if (!isPresent(this.grid.rowSelected)) {
      this.grid.rowSelected = row => this.selectedKeys.includes(this.getItemKey(row));
    }
    this.selectionChangeSubscription = this.grid.selectionChange.subscribe(this.onSelectionChange.bind(this));
  }

  destroy() {
    this.selectionChangeSubscription.unsubscribe();
  }

  reset() {
    this.selectedKeys.splice(0, this.selectedKeys.length);
  }

  getItemKey(row) {
    if (this.selectedBy) {
      if (isString(this.selectedBy)) {
        if (!(this.selectedBy in row.dataItem)) {
          throw new Error(`the selection key ${this.selectedBy} must exist in row data item!`);
        }
        return row.dataItem[this.selectedBy as string];
      }
      if (isFunction(this.selectedBy)) {
        return (this.selectedBy as Function)(row);
      }
    }
    return row.index;
  }

  onSelectionChange(selection) {
    const _this = this;
    selection.deselectedRows.forEach(item => {
      const itemKey = _this.getItemKey(item);
      const itemIndex = _this.selectedKeys.indexOf(itemKey);
      if (itemIndex >= 0) {
        _this.selectedKeys.splice(itemIndex, 1);
      }
    });
    if (this.grid.selectableSettings.mode === 'single' && this.selectedKeys.length > 0) {
      this.reset();
    }
    selection.selectedRows.forEach(item => {
      const itemKey = _this.getItemKey(item);
      if (!_this.selectedKeys.includes(itemKey)) {
        _this.selectedKeys.push(itemKey);
      }
    });
    this.selectedKeysChange.emit(this.selectedKeys);
  }
}

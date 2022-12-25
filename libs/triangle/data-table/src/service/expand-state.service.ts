/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter } from '@angular/core';

export class ExpandStateService {
  changes: EventEmitter<{
    dataItem: any;
    expand: boolean;
    index: number;
  }>;
  protected rowState;

  constructor(protected isInitiallyCollapsed: boolean) {
    this.changes = new EventEmitter();
    this.rowState = [];
  }

  toggleRow(index: any, dataItem: any): void {
    const rowIndex = this.rowState.indexOf(index);
    const expand = rowIndex === -1;
    this.rowState = expand
      ? this.rowState.concat([index])
      : this.rowState.slice(0, rowIndex).concat(this.rowState.slice(rowIndex + 1));
    this.changes.emit({dataItem, expand, index});
  }

  isExpanded(index: any): boolean {
    return this.rowState.includes(index);
  }

  reset(): void {
    this.rowState = [];
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';

// Incremented each time the service is instantiated.
let sequence = 0;

/**
 * @hidden
 */
@Injectable()
export class IdService {
  private prefix: string;

  constructor() {
    this.prefix = `k-grid${sequence++}`;
  }

  cellId(rowIndex: number, colIndex: number): string {
    return `${this.prefix}-r${rowIndex}c${colIndex}`;
  }

  selectionCheckboxId(itemIndex: any): string {
    return `${this.prefix}-checkbox${itemIndex}`;
  }

  selectAllCheckboxId(): string {
    return `${this.prefix}-select-all`;
  }
}

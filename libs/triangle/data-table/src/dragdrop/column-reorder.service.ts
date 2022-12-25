/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';

/**
 * @hidden
 */
@Injectable()
export class ColumnReorderService {
  changes: EventEmitter<any> = new EventEmitter<any>();

  reorder(e: any): void {
    this.changes.emit(e);
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter } from '@angular/core';

/**
 * @hidden
 */
export class DataChangeNotificationService {
  readonly changes: EventEmitter<void>;

  constructor() {
    this.changes = new EventEmitter();
  }

  notify() {
    this.changes.emit();
  }
}

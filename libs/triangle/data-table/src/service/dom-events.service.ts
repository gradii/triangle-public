/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class DomEventsService {
  cellClick = new EventEmitter();
  cellMousedown = new EventEmitter();

  constructor() {
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class StepConnectService {
  lastElementSizeEvent = new EventEmitter();

  currentEvent = new EventEmitter();

  current: number;

  itemIndex = 0;

  id: any;

  direction = 'horizontal';

  directionEvent = new EventEmitter();

  processDot = false;

  processDotEvent = new EventEmitter();

  errorIndexObject = new EventEmitter();

  errorIndex: string;

  constructor() {
  }
}

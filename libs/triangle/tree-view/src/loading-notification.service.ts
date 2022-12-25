/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LoadingNotificationService {
  changes: Subject<string>;

  /**
   * @hidden
   */
  constructor() {
    this.changes = new Subject();
  }

  notifyLoaded(uid: string) {
    this.changes.next(uid);
  }
}

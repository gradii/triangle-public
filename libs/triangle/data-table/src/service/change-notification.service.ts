/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { take } from 'rxjs/operators';

@Injectable()
export class ChangeNotificationService {
  changes: EventEmitter<any>;
  private ngZone;
  private subscription;

  constructor(ngZone: NgZone) {
    this.ngZone = ngZone;
    this.changes = new EventEmitter();
  }

  notify() {
    const _this = this;
    if (!this.subscription || this.subscription.closed) {
      this.subscription = this.ngZone.onStable.pipe(take(1)).subscribe(() => _this.changes.emit());
    }
  }
}

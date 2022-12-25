/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { I18nService } from './i18n.service';

@Pipe({
  name: 'triI18n'
})
export class I18nPipe implements PipeTransform {
  private _subscription: Subscription;

  constructor(private i18n: I18nService, private cdr: ChangeDetectorRef) {
  }

  transform(path: string, keyValue?: object): string {
    return this.i18n.translate(path, keyValue);
  }

  ngOnInit() {
    this._subscription = this.i18n.localeChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }
}

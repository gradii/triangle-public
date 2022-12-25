/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';

@Directive({
  selector: '[tri-select-unselectable]',
  host    : {
    '[attr.unselectable]': '"unselectable"',
    '[style.user-select]': '"none"'
  }
})
export class SelectUnselectableDirective {
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[triFormItemRequired], [tri-form-item-required]',
  host    : {
    'class'                         : 'tri-form-item-required',
    '[class.tri-form-item-required]': 'required'
  }
})
export class FormItemRequiredDirective {
  @Input()
  required = true;
}

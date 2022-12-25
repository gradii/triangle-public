/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';

@Directive({
  selector: 'tri-form-text, [triFormText], [tri-form-text]',
  host    : {
    'class': 'tri-form-text'
  }
})
export class FormTextDirective {
}

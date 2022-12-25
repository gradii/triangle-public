/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';

@Directive({
  selector: 'tri-form-split, [triFormSplit], [tri-form-split]',
  host    : {
    'class': 'tri-form-split'
  }
})
export class FormSplitDirective {
}

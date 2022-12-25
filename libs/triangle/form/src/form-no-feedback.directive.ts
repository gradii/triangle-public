/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';


@Directive({
  selector: 'tri-switch, tri-checkbox-group, tri-checkbox, tri-radio-group, tri-radio, tri-button-group, tri-input-number',
  host    : {
    'class': 'no-feedback'
  }
})
export class FormNoFeedbackDirective {
  constructor() {
  }
}

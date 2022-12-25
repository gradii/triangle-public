/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ViewEncapsulation } from '@angular/core';

import { RadioComponent } from './radio.component';

@Component({
  selector     : 'tri-radio-button, [tri-radio-button]',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <span [class.tri-radio-button]="true"
          [class.tri-radio-button-checked]="_checked"
          [class.tri-radio-button-focused]="_focused"
          [class.tri-radio-button-disabled]="_disabled">
      <span class="tri-radio-button-inner"></span>
      <input type="radio"
             class="tri-radio-button-input"
             [(ngModel)]="_checked"
             (focus)="focus()"
             (blur)="blur()">
    </span>
    <ng-content></ng-content>
  `,
  host         : {
    '[class.tri-radio-button-wrapper]'         : 'true',
    '[class.tri-radio-button-wrapper-disabled]': 'disabled',
    '[class.tri-radio-button-wrapper-checked]' : 'checked'
  }
})
export class RadioButtonComponent extends RadioComponent {
}

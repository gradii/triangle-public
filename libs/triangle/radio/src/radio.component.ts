/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ContentChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { isFunction } from '@gradii/triangle/util';
import { RadioTileDirective } from './radio-tile.directive';

export interface RadioOption {
  value: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

@Component({
  selector     : '[tri-radio]',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <span [class.tri-radio]="true"
          [class.tri-radio-checked]="_checked"
          [class.tri-radio-focused]="_focused"
          [class.tri-radio-disabled]="_disabled">
      <span class="tri-radio-inner"></span>
      <input type="radio"
             class="tri-radio-input"
             [(ngModel)]="checked"
             (focus)="focus()"
             (blur)="blur()">
    </span>
    <ng-content></ng-content>
    <ng-template
      [ngIf]="labelTemplate"
      [ngTemplateOutlet]="labelTemplate"></ng-template>
    <span *ngIf="!labelTemplate&&!!label">{{label}}</span>
  `,
  host         : {
    '[class.tri-radio-wrapper]': 'true'
  }
})
export class RadioComponent extends RadioTileDirective implements RadioOption {
  @ContentChild(TemplateRef, {static: false}) labelTemplate: TemplateRef<any>;

  focus() {
    this._focused = true;
  }

  blur() {
    this._focused = false;
    if (isFunction(this.radioGroup.onTouched)) {
      this.radioGroup.onTouched();
    }
  }
}

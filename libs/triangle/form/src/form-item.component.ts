/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Host, Inject, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { FormComponent } from './form.component';

@Component({
  selector     : 'tri-form-item',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ng-content></ng-content>`,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../style/form-item.scss'],
  host     : {
    'class'                           : 'tri-form-item',
    '[class.tri-form-item-vertical]'  : 'layout === "vertical"',
    '[class.tri-form-item-horizontal]': 'layout === "horizontal"',
    '[class.tri-form-item-inline]'    : 'layout === "inline"',
    '[class.tri-form-item-with-help]' : 'withHelp'
  },
})
export class FormItemComponent {
  @Input()
  layout: 'vertical' | 'horizontal' | 'inline' | undefined;

  @Output()
  layoutChange: EventEmitter<any> = new EventEmitter();

  getLayout(): 'vertical' | 'horizontal' | 'inline' | undefined {
    if (this.layout && this.form && this.layout !== this.form.layout) {
      return this.layout;
    }
    return undefined;
  }

  constructor(@Optional() @Host() @Inject(FormComponent)
              private form: FormComponent | undefined) {
  }

  _withHelp = 0;

  get withHelp(): boolean {
    return this._withHelp > 0;
  }

  enableHelp() {
    this._withHelp++;
  }

  disableHelp() {
    this._withHelp--;
  }
}

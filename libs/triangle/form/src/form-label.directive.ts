/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Host, Inject, Input, Optional } from '@angular/core';
import { FormItemComponent } from './form-item.component';
import { tolerantClamp } from './_utils';
import { FormComponent } from './form.component';

@Directive({
  selector: 'tri-form-label, [triFormLabel], [tri-form-label]',
  host    : {
    'class'              : 'tri-form-item-label',
    '[style.width.px]'   : 'getRealLayout()==="horizontal"?labelSize:null',
    '[style.flex]'       : 'getRealLayout()==="horizontal"&&labelSize?"0 0 "+labelSize+"px":null',
    '[style.minWidth.px]': 'minLabelSize',
    '[style.maxWidth.px]': 'maxLabelSize',
  }
})
export class FormLabelDirective {

  constructor(@Optional() @Host() @Inject(FormComponent)
              private form: FormComponent | undefined,
              @Host() @Inject(FormItemComponent)
              private formItem: FormItemComponent | undefined
  ) {
  }

  getRealLayout() {
    if (this.formItem && this.formItem.layout) {
      return this.formItem.layout;
    } else if (this.form && this.form.layout) {
      return this.form.layout;
    }
    return undefined;
  }

  protected _labelSize: number;

  @Input()
  minLabelSize: number;

  @Input()
  maxLabelSize: number;

  @Input()
  get labelSize() {
    let size;
    if (this._labelSize) {
      size = this._labelSize;
    } else if (this.form) {
      size = this.form.labelSize;
    }

    return tolerantClamp(size, this.minLabelSize, this.maxLabelSize);
  }

  set labelSize(value) {
    this._labelSize = value;
  }
}

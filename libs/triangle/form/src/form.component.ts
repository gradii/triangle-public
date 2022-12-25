/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector     : '[tri-form]',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ng-content></ng-content>`,
  styleUrls    : ['../style/form.scss'],
  host         : {
    '[class.tri-form-horizontal]': '_layout == "horizontal"',
    '[class.tri-form-vertical]'  : '_layout == "vertical"',
    '[class.tri-form-inline]'    : '_layout == "inline"',
  }
})
export class FormComponent implements OnInit {

  private _labelSize: number = 200;

  @Input()
  get labelSize(): number {
    return this._labelSize;
  }

  set labelSize(value: number) {
    this._labelSize = value;
  }

  constructor() {
  }

  /** @internal */
  _layout: 'horizontal' | 'vertical' | 'inline' = 'horizontal';

  public get layout() {
    return this._layout;
  }

  /**
   * The layout of form
   * 表单布局
   * @param value
   */
  @Input()
  public set layout(value) {
    this._layout = value;
  }

  ngOnInit() {
  }
}

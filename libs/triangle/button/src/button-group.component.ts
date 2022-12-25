/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, ViewEncapsulation } from '@angular/core';

export type ButtonGroupSize = 'large' | 'lg' |
  'default' |
  'small' | 'sm' |
  'xsmall' | 'xs';

@Component({
  selector     : 'tri-button-group',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ng-content></ng-content>
  `,
  host         : {
    '[class.tri-btn-group]'   : 'true',
    '[class.tri-btn-group-lg]': '_size=="large" || _size==="lg"',
    '[class.tri-btn-group-sm]': '_size=="small" || _size==="sm"',
    '[class.tri-btn-group-xs]': '_size=="xsmall" || _size==="xs"'
  },
})
export class ButtonGroupComponent {
  _size: ButtonGroupSize;

  @Input()
  get size(): ButtonGroupSize {
    return this._size;
  }

  set size(value: ButtonGroupSize) {
    this._size = value;
  }

  static ngAcceptInputType_size: ButtonGroupSize | keyof ButtonGroupSize | string;

}

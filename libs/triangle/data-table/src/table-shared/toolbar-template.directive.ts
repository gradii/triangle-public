/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triDataTableToolbarTemplate], ng-template[triDataTableToolbarTemplate]'
})
export class ToolbarTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
    this._position = 'top';
  }

  _position: 'top' | 'bottom' | 'both';

  @Input()
  get position() {
    return this._position;
  }

  set position(position) {
    this._position = position;
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector           : 'tri-footer, tri-layout-footer',
  encapsulation      : ViewEncapsulation.None,
  template           : `
    <ng-content></ng-content>
  `
})
export class Footer {
  @HostBinding('class.tri-layout-footer') _layoutFooter = true;
}

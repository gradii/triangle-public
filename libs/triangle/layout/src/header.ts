/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector           : 'tri-header, tri-layout-header',
  encapsulation      : ViewEncapsulation.None,
  template           : `
    <ng-content></ng-content>
  `,
  host               : {
    '[class.tri-layout-light]': "theme === 'light'",
    '[class.tri-layout-dark]' : "theme === 'dark'"
  }
})
export class Header {
  @Input() theme: 'light' | 'dark';

  @HostBinding('class.tri-layout-header') _layoutHeader = true;
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector     : 'tri-layout',
  encapsulation: ViewEncapsulation.None,
  template     : `
      <ng-content></ng-content>
  `,
  styleUrls    : ['../style/layout.scss'],
  styles       : [
    `:host {
          display : block;
      }`
  ],
})
export class Layout {
  @HostBinding('class.tri-layout-has-sider') hasSider = false;

  @HostBinding('class.tri-layout') _layout = true;
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector           : 'tri-content, tri-layout-content',
  encapsulation      : ViewEncapsulation.None,
  template           : `
    <ng-content></ng-content>
  `
})
export class Content {
  @HostBinding('class.tri-layout-content') _layoutContent = true;
}

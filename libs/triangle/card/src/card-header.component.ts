/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component } from '@angular/core';


@Component({
  selector: 'tri-card-header',
  template: `
    <div class="tri-card-header-title">
      <ng-content select=":not(tri-card-header-extra)"></ng-content>
    </div>
    <ng-content select="tri-card-header-extra"></ng-content>
  `,
  host    : {
    'class': 'tri-card-header'
  }
})
export class TriCardHeaderComponent {

}


@Component({
  selector: 'tri-card-header-extra',
  template: `
    <ng-content></ng-content>
  `,
  host    : {
    'class': 'tri-card-header-extra'
  }
})
export class TriCardHeaderExtraComponent {

}

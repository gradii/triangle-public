/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component } from '@angular/core';

@Component({
  selector: 'tri-card-loading',
  template: `
    <div>
      <p class="tri-card-loading-block" style="width: 94%;"></p>
      <p>
        <span class="tri-card-loading-block" style="width: 28%;"></span>
        <span class="tri-card-loading-block" style="width: 62%;"></span>
      </p>
      <p>
        <span class="tri-card-loading-block" style="width: 22%;"></span>
        <span class="tri-card-loading-block" style="width: 66%;"></span>
      </p>
      <p>
        <span class="tri-card-loading-block" style="width: 56%;"></span>
        <span class="tri-card-loading-block" style="width: 39%;"></span>
      </p>
      <p>
        <span class="tri-card-loading-block" style="width: 21%;"></span>
        <span class="tri-card-loading-block" style="width: 15%;"></span>
        <span class="tri-card-loading-block" style="width: 40%;"></span>
      </p>
    </div>
  `
})
export class TriCardLoadingComponent {

}

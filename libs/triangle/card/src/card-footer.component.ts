/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'tri-card-footer',
  template: `
      <ng-content></ng-content>
  `,
  host    : {
    'class': 'tri-card-footer',
    '[class.tri-card-footer-align-end]': 'align === "end"',
  }
})
export class TriCardFooterComponent {
  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'end';
}

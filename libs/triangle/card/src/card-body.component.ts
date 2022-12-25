/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'tri-card-body',
  template: `
    <ng-template [ngIf]="loading">
      <tri-card-loading></tri-card-loading>
    </ng-template>
    <ng-template [ngIf]="!loading">
      <ng-content></ng-content>
    </ng-template>
  `,
  host    : {
    'class': 'tri-card-body'
  }
})
export class TriCardBodyComponent {

  @Input()
  loading: boolean = false;
}

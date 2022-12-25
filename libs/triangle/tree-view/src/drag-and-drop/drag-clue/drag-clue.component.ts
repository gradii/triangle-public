/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { TreeItemLookup } from '../../tree-item-lookup.interface';
import { DropAction } from '../models';

@Component({
  selector       : 'tri-tree-view-drag-clue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ng-container *ngIf="!template">
      <span class="tri-icon {{statusIconClass}} tri-drag-status"></span>
      <span>{{text}}</span>
    </ng-container>

    <ng-template
      *ngIf="template"
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{
        text: text,
        action: action,
        sourceItem: sourceItem,
        destinationItem: destinationItem
      }"
    >
    </ng-template>
  `,
  host           : {
    '[class.tri-header]': 'hostClasses',
    '[style.position]': 'posistionStyle'
  }
})
export class DragClueComponent {
  cdr: any;

  hostClasses: boolean;
  text: string;
  action: DropAction;
  sourceItem: TreeItemLookup;
  destinationItem: TreeItemLookup;
  template: TemplateRef<any>;

  posistionStyle: string;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr            = cdr;
    this.hostClasses    = true;
    this.posistionStyle = 'fixed';
  }

  get statusIconClass(): string {
    switch (this.action) {
      case DropAction.Add:
        return 'tri-i-plus';
      case DropAction.InsertTop:
        return 'tri-i-insert-up';
      case DropAction.InsertBottom:
        return 'tri-i-insert-down';
      case DropAction.InsertMiddle:
        return 'tri-i-insert-middle';
      case DropAction.Invalid:
      default:
        return 'tri-i-cancel';
    }
  }

  // exposed as a public method that can be called from outside as the component uses `OnPush` strategy
  detectChanges() {
    this.cdr.detectChanges();
  }
}

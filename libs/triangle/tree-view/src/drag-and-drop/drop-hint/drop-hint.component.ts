/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { TreeItemLookup } from '../../tree-item-lookup.interface';
import { DropAction } from '../models';

@Component({
  selector       : 'tri-tree-view-drop-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <div
      *ngIf="!template"
      class="tri-drop-hint tri-drop-hint-h"
    >
      <div class='tri-drop-hint-start'></div>
      <div class='tri-drop-hint-line'></div>
    </div>

    <ng-template
      *ngIf="template"
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{
                action: action,
                sourceItem: sourceItem,
                destinationItem: destinationItem
            }"
    >
      <ng-template>
  `,
  host           : {
    '[class.tri-drop-hint-container]': 'hostClass',
    '[style.position]'               : 'position',
    '[style.pointer-events]'         : 'pointerEvents'
  }
})
export class DropHintComponent {
  template: TemplateRef<any>;
  hostClass: boolean;
  position: string;
  pointerEvents: string;
  action: DropAction;
  sourceItem: TreeItemLookup;
  destinationItem: TreeItemLookup;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.hostClass     = true;
    this.position      = 'fixed';
    this.pointerEvents = 'none';
  }

  // exposed as a public method that can be called from outside as the component uses `OnPush` strategy
  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }
}

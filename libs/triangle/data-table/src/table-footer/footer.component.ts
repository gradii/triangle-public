/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, Input, QueryList } from '@angular/core';
import { GroupDescriptor } from '@gradii/triangle/data-query';
import { ColumnBase } from '../columns/column-base';
import { ColumnComponent } from '../columns/column.component';
import { columnsToRender } from '../helper/column-common';
import { DetailTemplateDirective } from '../table-shared/detail-template.directive';

@Component({
  selector: '[triGridFooter]',
  template: `
    <ng-template [ngIf]="true">
      <tr [class.tri-footer-template]="true">
        <td
          [class.tri-group-cell]="true"
          *ngFor="let g of groups">
        </td>
        <td
          [class.tri-hierarchy-cell]="true"
          *ngIf="detailTemplate?.templateRef">
        </td>
        <td
          [ngClass]="column.footerClass"
          [ngStyle]="column.footerStyle"
          *ngFor="let column of columnsToRender; let columnIndex = index">
          <ng-template
            [ngTemplateOutlet]="column.footerTemplateRef"
            [ngTemplateOutletContext]="{
                        columnIndex: lockedColumnsCount + columnIndex,
                        column: column,
                        $implicit: column
                        }">
          </ng-template>
        </td>
      </tr>
    </ng-template>
  `
})
export class FooterComponent {
  @Input() columns: ColumnComponent[] | QueryList<ColumnBase>;
  @Input() groups: GroupDescriptor[];
  @Input() detailTemplate: DetailTemplateDirective;
  @Input() scrollable: boolean;
  @Input() lockedColumnsCount: number;

  constructor() {
    this.columns = [];
    this.groups = [];
    this.lockedColumnsCount = 0;
  }

  @HostBinding('class.tri-data-table-footer')
  get footerClass(): boolean {
    return !this.scrollable;
  }

  get columnsToRender(): ColumnBase[] {
    return columnsToRender(this.columns || []);
  }
}

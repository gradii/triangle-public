/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, QueryList, ViewEncapsulation } from '@angular/core';
import { GroupDescriptor } from '@gradii/triangle/data-query';
import { ColumnBase } from './columns/column-base';
import { ColumnComponent } from './columns/column.component';
import { columnsToRender } from './helper/column-common';
import { DetailTemplateDirective } from './table-shared/detail-template.directive';

@Component({
  selector     : '[triGridColGroup], [tri-grid-col-group]',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ng-template [ngIf]="true">
      <col [class.tri-group-col]="true" *ngFor="let g of groups"/>
      <col [class.tri-hierarchy-col]="true" *ngIf="detailTemplate?.templateRef"/>
      <col *ngFor="let column of columnsToRender"
           [style.width.px]="column.width"
           [style.minWidth.px]="column.minWidth"
           [style.maxWidth.px]="column.maxWidth"/>
    </ng-template>
  `
})
export class ColGroupComponent {
  @Input() columns: QueryList<ColumnComponent | ColumnBase> | Array<ColumnComponent | ColumnBase>;
  @Input() groups: GroupDescriptor[];
  @Input() detailTemplate: DetailTemplateDirective;

  constructor() {
    this.columns = [];
    this.groups = [];
  }

  get columnsToRender(): ColumnBase[] {
    return columnsToRender(this.columns);
  }
}

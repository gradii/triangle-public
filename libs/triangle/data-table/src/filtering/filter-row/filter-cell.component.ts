/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor } from '@gradii/triangle/data-query';
import { ColumnBase } from '../../columns/column-base';
import { isNullOrEmptyString, isPresent } from '@gradii/triangle/util';

@Component({
  selector           : '[triGridFilterCell]',
  template           : `
    <ng-template [ngIf]="isFilterable">
      <ng-container [ngSwitch]="hasTemplate">
        <ng-template [ngSwitchCase]="false">
          <ng-container triFilterHost [column]="column" [filter]="filter"></ng-container>
        </ng-template>
        <ng-template [ngSwitchCase]="true">
          <ng-template
            *ngIf="column.filterCellTemplateRef"
            [ngTemplateOutlet]="column.filterCellTemplateRef"
            [ngTemplateOutletContext]="templateContext">
          </ng-template>
        </ng-template>
      </ng-container>
    </ng-template>
  `
})
export class FilterCellComponent {
  @Input() column: ColumnBase | any;
  @Input() filter: CompositeFilterDescriptor;

  constructor() {
    this._templateContext = {};
  }

  private _templateContext;

  get templateContext() {
    this._templateContext.column = this.column;
    this._templateContext.filter = this.filter;
    this._templateContext['$implicit'] = this.filter;
    return this._templateContext;
  }

  get hasTemplate() {
    return isPresent(this.column.filterCellTemplateRef);
  }

  get isFilterable() {
    return isPresent(this.column) && !isNullOrEmptyString(this.column.field) && this.column.filterable;
  }
}

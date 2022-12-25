/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { isNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { ColumnComponent } from '../../../columns/column.component';
import { extractFormat } from '../../../utils';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'tri-data-table-string-filter-simple',
  template: `
    <div tri-row [gutter]="12">
      <div tri-col [span]="24">
        <tri-input class="mb-2" [ngModel]="firstFilter?.value" (ngModelChange)="onChange($event, firstFilter)"></tri-input>
      </div>
    </div>
  `
})
export class StringFilterSimpleComponent extends BaseFilterCellComponent {

  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() extra: boolean = true;
  @Input() filterService: FilterService;

  constructor(protected localization: I18nService) {
    super(null);
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column!.field);
  }

  get columnFormat() {
    return this.column && !isNullOrEmptyString(this.column.format) ? extractFormat(this.column.format) : 'd';
  }

  get currentOperator() {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }

  get firstFilter(): FilterDescriptor {
    if (isPresent(this.filter) && isPresent(this.filter.filters) && this.filter.filters.length) {
      return this.filter.filters[0] as FilterDescriptor;
    } else {
      return this.insertDefaultFilter(0, {
        field   : this.column!.field,
        operator: this.currentOperator
      });
    }
  }

  onChange(value, filter: FilterDescriptor) {
    filter.value = value;
    this.applyFilter(this.filter);
  }

  private insertDefaultFilter(index, filter) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { isNotNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { ColumnComponent } from '../../../columns/column.component';
import { extractFormat } from '../../../utils';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'tri-data-table-date-filter-simple',
  template: `
    <!--
    <tri-data-table-date-filter-simple-input
      class="mb-2"
      [currentFilter]="firstFilter"
      [filterService]="filterService"
      [column]="column"
      [filter]="filter"
      [format]="format"
      [min]="min"
      [max]="max">
    </tri-data-table-date-filter-simple-input>
    -->

    <tri-date-picker
      #picker
      class="mb-2"
      [ngModel]="firstFilter?.value"
      (ngModelChange)="onChange($event, firstFilter)"
      [format]="columnFormat"
    >
      <!--[min]="min"-->
      <!--[max]="max"-->
    </tri-date-picker>
  `
})
export class DateFilterSimpleComponent extends BaseFilterCellComponent {

  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() min;
  @Input() max;
  @Input() extra: boolean = true;
  @Input() filterService: FilterService;

  constructor(protected localization: I18nService) {
    // super(null, localization);
    super(null);
  }

  @HostBinding('class.tri-filtercell')
  get hostClasses(): boolean {
    return false;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get columnFormat() {
    return this.column && isNotNullOrEmptyString(this.column!.format) ? extractFormat(this.column.format) : 'yyyy-MM-dd';
  }

  get currentOperator() {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }

  get firstFilter() {
    if (isPresent(this.filter) && isPresent(this.filter.filters) && this.filter.filters.length) {
      return this.filter.filters[0];
    } else {
      return this.insertDefaultFilter(0, {
        field   : this.column!.field,
        operator: this.currentOperator
      });
    }
  }

  insertDefaultFilter(index, filter) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }

  onChange(value, filter: FilterDescriptor) {
    filter.value = value;
    this.applyFilter(this.filter);
  }
}

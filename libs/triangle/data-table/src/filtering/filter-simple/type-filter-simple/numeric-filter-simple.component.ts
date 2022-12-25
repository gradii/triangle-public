/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { isNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { ColumnComponent } from '../../../columns/column.component';
import { extractFormat } from '../../../utils';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector           : 'tri-data-table-numeric-filter-simple',
  template           : `
    <div tri-row [gutter]="12">
      <div tri-col [span]="24">
        <tri-input-number class="mb-2"
                          [ngModel]="firstFilter?.value"
                          (ngModelChange)="onChange($event, firstFilter)"
                          [spinners]="spinners"
                          [min]="min"
                          [max]="max"
                          [step]="step"
        ></tri-input-number>
      </div>
    </div>
  `
})
export class NumericFilterSimpleComponent extends BaseFilterCellComponent {
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() min: number;
  @Input() max: number;
  @Input() spinners: boolean;
  @Input() format: string;
  @Input() decimals: string;
  @Input() step: number;
  @Input() extra: boolean = true;
  @Input() filterService: FilterService;

  constructor(localization: I18nService) {
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

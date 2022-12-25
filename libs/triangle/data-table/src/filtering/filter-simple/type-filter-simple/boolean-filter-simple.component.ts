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
  selector: 'tri-data-table-boolean-filter-simple',
  template: `
    <div tri-row [gutter]="12">
      <div tri-col [span]="24">
        <tri-input class="mb-2" [ngModel]="firstFilter?.value" (ngModelChange)="onChange($event, firstFilter)"></tri-input>
      </div>
    </div>`
})
export class BooleanFilterSimpleComponent extends BaseFilterCellComponent {

  @Input() column: ColumnComponent;
  @Input() items: { label: string, value: boolean }[] = [
    {label: this.localization.translate('filterIsTrue'), value: true},
    {label: this.localization.translate('filterIsFalse'), value: false}
  ];
  @Input() operator: string;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
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

  // radioId(value: any): string {
  //   return `${this.idPrefix}_${value}`;
  // }

  insertDefaultFilter(index, filter) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }


  onChange(value: any, filter): void {
    filter.value = value;
    this.applyFilter(
      this.updateFilter(filter)
    );
  }

  isSelected(radioValue: any): boolean {
    return this.filtersByField(this.column.field).some(({value}) => value === radioValue);
  }
}

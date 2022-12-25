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
  selector           : 'tri-data-table-numeric-filter-menu',
  template           : `
    <tri-data-table-numeric-filter-menu-input
      [currentFilter]="firstFilter"
      [operators]="operators"
      [filterService]="filterService"
      [column]="column"
      [filter]="filter"
      [format]="format"
      [decimals]="decimals"
      [spinners]="spinners"
      [min]="min"
      [max]="max"
      [step]="step"
    >
    </tri-data-table-numeric-filter-menu-input>
    <tri-select
      *ngIf="extra"
      class="tri-filter-and"
      [ngModel]="filter?.logic"
      (ngModelChange)="logicChange($event)">
      <tri-option *ngFor="let it of operators" [value]="it.value">{{it.label}}</tri-option>
    </tri-select>
    <tri-data-table-numeric-filter-menu-input
      *ngIf="extra"
      [operators]="operators"
      [currentFilter]="secondFilter"
      [filterService]="filterService"
      [column]="column"
      [filter]="filter"
      [format]="format"
      [decimals]="decimals"
      [spinners]="spinners"
      [min]="min"
      [max]="max"
      [step]="step"
    >
    </tri-data-table-numeric-filter-menu-input>
  `
}) /*extends NumericFilterComponent */
export class NumericFilterMenuComponent extends BaseFilterCellComponent {
  logicOperators: Array<{
    label: string;
    value: 'and' | 'or';
  }> = [{label: 'And', value: 'and'}, {label: 'Or', value: 'or'}];
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() min: number;
  @Input() max: number;
  @Input() spinners: boolean;
  @Input() format: string;
  @Input() decimals: number;
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

  get secondFilter(): FilterDescriptor {
    if (isPresent(this.filter) && isPresent(this.filter.filters) && this.filter.filters.length > 1) {
      return this.filter.filters[1] as FilterDescriptor;
    } else {
      return this.insertDefaultFilter(1, {
        field   : this.column.field,
        operator: this.currentOperator
      });
    }
  }

  logicChange(value: 'and' | 'or'): void {
    this.filter.logic = value;
  }

  private insertDefaultFilter(index: number, filter: any) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }
}

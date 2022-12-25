/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { ColumnComponent } from '../../columns/column.component';
import { extractFormat } from '../../utils';
import { BaseFilterCellComponent, localizeOperators } from '../base-filter-cell.component';
import { FilterComponent } from '../filter-component.interface';
import { FilterService } from '../filter.service';

const dateOperators = localizeOperators({
  filterEqOperator           : 'eq',
  filterNotEqOperator        : 'neq',
  filterAfterOrEqualOperator : 'gte',
  filterAfterOperator        : 'gt',
  filterBeforeOrEqualOperator: 'lte',
  filterBeforeOperator       : 'lt',
  filterIsNullOperator       : 'isnull',
  filterIsNotNullOperator    : 'isnotnull'
});

@Component({
  selector           : 'tri-data-table-date-filter-cell',
  template           : `
    <tri-data-table-filter-wrapper-cell
      [column]="column"
      [filter]="filter"
      [operators]="operators"
      [defaultOperator]="operator"
      [showOperators]="showOperators"
    >
      <!--<tri-datepicker-->
      <!--nzFilterInput-->
      <!--[value]="currentFilter?.value"-->
      <!--[format]="format"-->
      <!--[min]="min"-->
      <!--[max]="max"-->
      <!--&gt;-->
      <!--</tri-datepicker>-->
      <input triInput/>
    </tri-data-table-filter-wrapper-cell>
  `
})
export class DateFilterCellComponent extends BaseFilterCellComponent implements FilterComponent {
  showOperators: boolean;

  column: ColumnComponent;

  filter: CompositeFilterDescriptor;

  operator: string;

  min: Date;

  max: Date;
  protected defaultOperators: Array<{
    label: string;
    value: string;
  }>;

  constructor(filterService: FilterService) {
    super(filterService);

    this.showOperators = true;

    this.operator = 'gte';
    this.defaultOperators = [
      {label: '等于', value: 'eq'},
      {label: '不等于', value: 'neq'},
      {label: '大于等于', value: 'gte'},
      {label: '大于', value: 'gt'},
      {label: '小于等于', value: 'lte'},
      {label: '小于', value: 'lt'},
      {label: '不存在', value: 'isnull'},
      {label: '存在', value: 'isnotnull'}
    ];
  }

  private _format;

  get format() {
    return !isNullOrEmptyString(this._format) ? this._format : this.columnFormat;
  }

  set format(value) {
    this._format = value;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get currentOperator() {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }

  private get columnFormat() {
    return this.column && !isNullOrEmptyString(this.column.format) ? extractFormat(this.column.format) : 'd';
  }
}

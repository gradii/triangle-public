/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { ColumnComponent } from '../../columns/column.component';
import { BaseFilterCellComponent } from '../base-filter-cell.component';
import { FilterService } from '../filter.service';

@Component({
  selector           : 'tri-data-table-string-filter-cell',
  template           : `
                         <tri-data-table-filter-wrapper-cell
                           [column]="column"
                           [filter]="filter"
                           [operators]="operators"
                           [defaultOperator]="operator"
                           [showOperators]="showOperators">
                           <tri-input triFilterInput [ngModel]="currentFilter?.value"></tri-input>
                         </tri-data-table-filter-wrapper-cell>
                       `
})
export class StringFilterCellComponent extends BaseFilterCellComponent {
  showOperators: boolean;

  column: ColumnComponent;

  filter: CompositeFilterDescriptor;

  operator: string;
  protected defaultOperators: Array<{
    label: string;
    value: string;
  }>;

  constructor(filterService: FilterService) {
    super(filterService);

    this.showOperators = true;

    this.operator = 'contains';
    this.defaultOperators = [
      {label: 'eq', value: 'eq'},
      {label: 'neq', value: 'neq'},
      {label: 'contains', value: 'contains'},
      {label: 'doesnotcontain', value: 'doesnotcontain'},
      {label: 'startswith', value: 'startswith'},
      {label: 'endswith', value: 'endswith'},
      {label: 'isnull', value: 'isnull'},
      {label: 'isnotnull', value: 'isnotnull'},
      {label: 'isempty', value: 'isempty'},
      {label: 'isnotempty', value: 'isnotempty'}
    ];
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get currentOperator() {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }
}

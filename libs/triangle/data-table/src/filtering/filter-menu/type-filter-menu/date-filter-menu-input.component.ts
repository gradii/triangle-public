/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { ColumnComponent } from '../../../columns/column.component';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'tri-data-table-date-filter-menu-input',
  template: `
  <!--  <tri-data-table-filter-menu-input-wrapper
      [column]="column"
      [filter]="filter"
      [operators]="operators"
      [defaultOperator]="operator"
      [currentFilter]="currentFilter"
      [filterService]="filterService"
    >-->
      <tri-date-picker
        #picker
        triFilterInput
        [ngModel]="currentFilter?.value"
        [format]="format"
      >
      </tri-date-picker>
    <!--</tri-data-table-filter-menu-input-wrapper>-->
  `
})
export class DateFilterMenuInputComponent {
  @Input() operators: Array<{
    label: string;
    value: string;
  }>;
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor;
  @Input() operator: string;
  @Input() currentFilter: FilterDescriptor;
  @Input() filterService: FilterService;
  @Input() format: string;
  @Input() min: Date;
  @Input() max: Date;

  constructor() {
  }

}

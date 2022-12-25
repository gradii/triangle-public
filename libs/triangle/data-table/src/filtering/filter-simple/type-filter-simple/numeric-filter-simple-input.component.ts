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
  selector: 'tri-data-table-numeric-filter-simple-input',
  template: `
    <!--<tri-data-table-filter-menu-input-wrapper-->
      <!--[column]="column"-->
      <!--[filter]="filter"-->
      <!--[operators]="operators"-->
      <!--[defaultOperator]="operator"-->
      <!--[currentFilter]="currentFilter"-->
      <!--[filterService]="filterService"-->
    <!--&gt;-->
      <tri-input-number
        triFilterInput
        [ngModel]="currentFilter?.value"
        [spinners]="spinners"
        [min]="min"
        [max]="max"
        [step]="step"
      >
      </tri-input-number>
    <!--</tri-data-table-filter-menu-input-wrapper>-->
  `
})
export class NumericFilterSimpleInputComponent {
  @Input() operators: Array<{
    text: string;
    value: string;
  }> = [];
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor;
  @Input() operator: string;
  @Input() currentFilter: FilterDescriptor;
  @Input() filterService: FilterService;
  @Input() step: number = 1;
  @Input() min: number;
  @Input() max: number;
  @Input() spinners: boolean = true;
  @Input() decimals: number;
  @Input() format: string;
}

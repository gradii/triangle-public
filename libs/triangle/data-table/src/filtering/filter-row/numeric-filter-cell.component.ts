/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// tslint:disable:no-access-missing-member
import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { ColumnComponent } from '../../columns/column.component';
import { extractFormat } from '../../utils';
import { BaseFilterCellComponent } from '../base-filter-cell.component';
import { FilterService } from '../filter.service';

@Component({
  selector           : 'tri-data-table-numeric-filter-cell',
  template           : `
      <tri-data-table-filter-wrapper-cell
              [column]="column"
              [filter]="filter"
              [operators]="operators"
              [defaultOperator]="operator"
              [showOperators]="showOperators">
          <!--
          <tri-numerictextbox
             triFilterInput
             [autoCorrect]="true"
             [value]="currentFilter?.value"
             [format]="format"
             [decimals]="decimals"
             [spinners]="spinners"
             [min]="min"
             [max]="max"
             [step]="step">
           </tri-numerictextbox>
           -->
          <tri-input-number tri-filter-input [min]="min" [max]="max"
                            [step]="step"></tri-input-number>
      </tri-data-table-filter-wrapper-cell>
  `
})
export class NumericFilterCellComponent extends BaseFilterCellComponent {
  @Input() showOperators: boolean;

  @Input() column: ColumnComponent;

  @Input() filter: CompositeFilterDescriptor;

  @Input() operator: string;

  @Input() step: number;

  @Input() min: number;

  @Input() max: number;

  @Input() spinners: boolean;

  @Input() decimals: number;

  protected defaultOperators: Array<{
    label: string;
    value: string;
  }>;

  constructor(filterService: FilterService) {
    super(filterService);

    this.showOperators = true;

    this.operator = 'eq';

    this.step = 1;

    this.spinners = true;
    this.defaultOperators = [
      {label: 'eq', value: 'eq'},
      {label: 'neq', value: 'neq'},
      {label: 'gte', value: 'gte'},
      {label: 'gt', value: 'gt'},
      {label: 'lte', value: 'lte'},
      {label: 'lt', value: 'lt'},
      {label: 'isnull', value: 'isnull'},
      {label: 'isnotnull', value: 'isnotnull'}
    ];
  }

  private _format;

  @Input()
  get format() {
    return !isNullOrEmptyString(this._format) ? this._format : this.columnFormat;
  }

  set format(value) {
    this._format = value;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get currentOperator(): string {
    return this.currentFilter ? <string>this.currentFilter.operator : this.operator;
  }

  private get columnFormat() {
    return this.column && !isNullOrEmptyString(this.column.format) ? extractFormat(this.column.format) : 'n2';
  }
}

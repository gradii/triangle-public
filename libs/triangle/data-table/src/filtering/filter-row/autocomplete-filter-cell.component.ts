/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// tslint:disable:no-access-missing-member
import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { ColumnComponent } from '../../columns/column.component';
import { BaseFilterCellComponent } from '../base-filter-cell.component';
import { FilterService } from '../filter.service';

@Component({
  selector           : 'tri-data-table-autocomplete-filter-cell',
  template           : `
      <tri-data-table-filter-wrapper-cell
              [column]="column"
              [filter]="filter"
              [operators]="operators"
              [showOperators]="showOperators">
         <!-- <tri-dropdown>
              <ul tri-menu>
                  <li tri-menu-item
                      *ngFor="let item of data;">{{item[valueField]}}</li>
              </ul>
          </tri-dropdown>-->
      </tri-data-table-filter-wrapper-cell>
  `
})
export class AutoCompleteFilterCellComponent extends BaseFilterCellComponent {
  @Input() showOperators: boolean;
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor;
  @Input() data: any[];
  protected defaultOperators: Array<{
    label: string;
    value: string;
  }>;

  constructor(filterService: FilterService, column: ColumnComponent) {
    super(filterService);
    this.showOperators = true;
    this.defaultOperators = [
      {label: '包含', value: 'contains'},
      {label: '不包含', value: 'doesnotcontain'},
      {label: '等于', value: 'eq'},
      {label: '不等于', value: 'neq'},
      {label: '开始于', value: 'startswith'},
      {label: '结束于', value: 'endswith'},
      {label: '不存在', value: 'isnull'},
      {label: '存在', value: 'isnotnull'},
      {label: '为空', value: 'isempty'},
      {label: '不为空', value: 'isnotempty'}
    ];
    this.column = column;
  }

  private _valueField;

  @Input()
  get valueField(): string {
    return this._valueField ? this._valueField : this.column.field;
  }

  set valueField(value) {
    this._valueField = value;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get currentOperator(): string {
    return this.currentFilter ? <string>this.currentFilter.operator : 'contains';
  }
}

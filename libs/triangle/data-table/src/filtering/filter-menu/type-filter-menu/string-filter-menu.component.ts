/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { isBlank, isNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { ColumnComponent } from '../../../columns/column.component';
import { extractFormat } from '../../../utils';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'tri-data-table-string-filter-menu',
  template: `
    <div tri-row [gutter]="12">
      <div tri-col [span]="8">
        <tri-select class="mb-2"
                    [ngModel]="firstFilter.operator"
                    (ngModelChange)="operatorChange($event, firstFilter)"
        >
          <tri-option *ngFor="let it of operators" [value]="it.value">{{it.label}}</tri-option>
        </tri-select>
      </div>

      <div tri-col [span]="16">
        <tri-input class="mb-2" [ngModel]="firstFilter?.value"
                   (ngModelChange)="onChange($event, firstFilter)"></tri-input>
      </div>

      <div tri-col [span]="24">
        <tri-radio-group class="mb-2 align-self-center" *ngIf="extra"
                         [options]="logicOperators"
                         [ngModel]="filter?.logic"
                         (ngModelChange)="logicChange($event)">
        </tri-radio-group>
      </div>

      <div tri-col [span]="8">
        <tri-select class="mb-2" *ngIf="extra"
                    [ngModel]="secondFilter.operator"
                    (ngModelChange)="operatorChange($event, secondFilter)">
          <tri-option *ngFor="let it of operators" [value]="it.value">{{it.label}}</tri-option>
        </tri-select>
      </div>
      <div tri-col [span]="16">
        <tri-input *ngIf="extra" [ngModel]="secondFilter?.value"
                   (ngModelChange)="onChange($event, secondFilter)"></tri-input>
      </div>
    </div>
  `
}) /*extends StringFilterComponent*/
export class StringFilterMenuComponent extends BaseFilterCellComponent {
  logicOperators: Array<{
    label: string;
    value: 'and' | 'or';
  }> = [{label: 'And', value: 'and'}, {label: 'Or', value: 'or'}];
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() extra: boolean = true;
  @Input() filterService: FilterService;
  protected defaultOperators = [
    {label: this.localization.translate('包含'), value: 'contains'},
    {label: this.localization.translate('不包含'), value: 'doesnotcontain'},
    {label: this.localization.translate('等于'), value: 'eq'},
    {label: this.localization.translate('不等于'), value: 'neq'},
    {label: this.localization.translate('开始于'), value: 'startswith'},
    {label: this.localization.translate('结束于'), value: 'endswith'},
    {label: this.localization.translate('不存在'), value: 'isnull'},
    {label: this.localization.translate('存在'), value: 'isnotnull'},
    {label: this.localization.translate('为空'), value: 'isempty'},
    {label: this.localization.translate('不为空'), value: 'isnotempty'}
  ];

  constructor(protected localization: I18nService) {
    super(null);
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column!.field);
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
        field   : this.column!.field,
        operator: this.currentOperator
      });
    }
  }

  logicChange(value: 'and' | 'or'): void {
    this.filter.logic = value;
  }

  operatorChange(value, filter) {
    if (value === 'isnull' || value === 'isnotnull' || value === 'isempty' || value === 'isnotempty') {
      this.applyNoValueFilter(value, filter);
    } else if (!isBlank(value) && isPresent(this.currentFilter)) {
      filter.operator = value;
      this.onChange(this.currentFilter.value, filter);
    }
  }

  onChange(value, filter: FilterDescriptor) {
    filter.value = value;
    this.applyFilter(this.filter);
    // this.applyFilter(
    //   this.updateFilter({
    //     field: this.column.field,
    //     operator: filter.operator,
    //     value
    //   })
    // )
  }

  protected applyNoValueFilter(operator: string, filter: FilterDescriptor): void {
    filter.operator = operator;
    filter.value = null;
    this.applyFilter(this.filter);
    // this.applyFilter(
    //   this.updateFilter({
    //     field: this.column.field,
    //     operator,
    //     value: null
    //   })
    // );
  }

  private insertDefaultFilter(index, filter) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }

}

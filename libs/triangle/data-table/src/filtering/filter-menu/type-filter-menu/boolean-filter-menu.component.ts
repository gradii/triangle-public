/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, HostBinding, Input } from '@angular/core';
import { CompositeFilterDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { ColumnComponent } from '../../../columns/column.component';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'tri-data-table-boolean-filter-menu',
  template: `
    <tri-radio-group>
      <label tri-radio *ngFor="let item of items"
             [checked]="isSelected(item.value)"
             [label]="item.label"
             [ngModel]="item.value"
             (ngModelChange)="onChange(item.value)"
      >
      </label>
    </tri-radio-group>
  `
})
export class BooleanFilterMenuComponent extends BaseFilterCellComponent {

  @Input() column: ColumnComponent;
  @Input() items: { label: string, value: boolean }[] = [
    {label: this.localization.translate('filterIsTrue'), value: true},
    {label: this.localization.translate('filterIsFalse'), value: false}
  ];
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

  // radioId(value: any): string {
  //   return `${this.idPrefix}_${value}`;
  // }

  onChange(value: any): void {
    this.applyFilter(
      this.updateFilter({
        field   : this.column.field,
        operator: 'eq',
        value
      })
    );
  }

  isSelected(radioValue: any): boolean {
    return this.filtersByField(this.column.field).some(({value}) => value === radioValue);
  }
}

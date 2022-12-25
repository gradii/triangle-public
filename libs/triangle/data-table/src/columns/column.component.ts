/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  ContentChild,
  forwardRef,
  Host,
  Input,
  Optional,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { isPresent } from '@gradii/triangle/util';
import { CellTemplateDirective } from '../directive/cell-template.directive';
import { EditTemplateDirective } from '../directive/edit-template.directive';
import { FilterMenuTemplateDirective } from '../filtering/filter-menu/filter-menu-template.directive';
import { FilterCellTemplateDirective } from '../filtering/filter-row/filter-cell-template.directive';
import { FilterSimpleTemplateDirective } from '../filtering/filter-simple/filter-simple-template.directive';
import { GroupFooterTemplateDirective } from '../grouping/group-footer-template.directive';
import { GroupHeaderTemplateDirective } from '../grouping/group-header-template.directive';
import { ColumnSortSettings } from '../helper/sort-settings';
import { AutoGenerateColumnPositon, ColumnBase } from './column-base';

export function isColumnComponent(column): column is ColumnComponent {
  return isPresent(column.field);
}

@Component({
  selector : 'tri-data-table-column',
  providers: [
    {
      provide    : ColumnBase,
      useExisting: forwardRef(() => ColumnComponent)
    }
  ],
  template : ''
})
export class ColumnComponent extends ColumnBase {
  autoGenerateColumnPosition = 'middle' as AutoGenerateColumnPositon;

  @Input() field: string;
  @Input() format: string;
  @Input() sortable: boolean | ColumnSortSettings = {mode: 'single'} as ColumnSortSettings;
  @Input() groupable: boolean = true;
  @Input() editor: 'text' | 'textarea' | 'numeric' | 'date' | 'boolean' | 'datetime' | string;
  @Input() filter: 'text' | 'numeric' | 'boolean' | 'date' | 'datetime' | string;
  @Input() filterable: boolean = true;
  @Input() editable: boolean = true;
  @ContentChild(CellTemplateDirective, {static: false}) cellTemplate: CellTemplateDirective;
  @ContentChild(GroupHeaderTemplateDirective, {static: false}) groupHeaderTemplate: GroupHeaderTemplateDirective;
  @ContentChild(GroupFooterTemplateDirective, {static: false}) groupFooterTemplate: GroupFooterTemplateDirective;
  @ContentChild(EditTemplateDirective, {static: false}) editTemplate: EditTemplateDirective;
  @ContentChild(FilterCellTemplateDirective, {static: false}) filterCellTemplate: FilterCellTemplateDirective;
  @ContentChild(FilterMenuTemplateDirective, {static: false}) filterMenuTemplate: FilterMenuTemplateDirective;
  @ContentChild(FilterSimpleTemplateDirective, {static: false}) filterSimpleTemplate: FilterSimpleTemplateDirective;

  constructor(@SkipSelf()
              @Host()
              @Optional()
                parent?: ColumnBase) {
    super(parent);
  }

  get templateRef(): TemplateRef<any> {
    return this.cellTemplate ? this.cellTemplate.templateRef : undefined;
  }

  get groupHeaderTemplateRef(): TemplateRef<any> {
    return this.groupHeaderTemplate ? this.groupHeaderTemplate.templateRef : undefined;
  }

  get groupFooterTemplateRef(): TemplateRef<any> {
    return this.groupFooterTemplate ? this.groupFooterTemplate.templateRef : undefined;
  }

  get editTemplateRef(): TemplateRef<any> {
    return this.editTemplate ? this.editTemplate.templateRef : undefined;
  }

  get filterCellTemplateRef(): TemplateRef<any> {
    return this.filterCellTemplate ? this.filterCellTemplate.templateRef : undefined;
  }

  get filterMenuTemplateRef(): TemplateRef<any> {
    return this.filterMenuTemplate ? this.filterMenuTemplate.templateRef : undefined;
  }

  get filterSimpleTemplateRef(): TemplateRef<any> {
    return this.filterSimpleTemplate ? this.filterSimpleTemplate.templateRef : undefined;
  }

  get displayTitle(): string {
    return this.title === undefined ? this.field : this.title;
  }
}

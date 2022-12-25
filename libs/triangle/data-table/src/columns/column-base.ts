/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ContentChildren, Directive, Input, QueryList, TemplateRef } from '@angular/core';
import { CheckboxColumnComponent } from '../columns/checkbox-column.component';
import { HierarchyColumnComponent } from '../columns/hierarchy-column.component';
import { FooterTemplateDirective } from '../table-footer/footer-template.directive';
import { HeaderTemplateDirective } from '../table-header/header-template.directive';

export const isSpanColumn = column => column.isSpanColumn;

export function isCheckboxColumn(column) {
  return (column as CheckboxColumnComponent).isCheckboxColumn;
}

export function isHierarchyColumn(column) {
  return (column as HierarchyColumnComponent).isHierarchyColumn;
}

function isColumnContainer(column) {
  return column.isColumnGroup || isSpanColumn(column);
}

export type AutoGenerateColumnPositon = 'start' | 'middle' | 'end';

@Directive()
export class ColumnBase {
  matchesMedia: boolean = true;
  orderIndex: number = 0;
  autoGenerateColumnPosition: AutoGenerateColumnPositon;

  isColumnGroup: boolean;
  isSpanColumn: boolean;

  @Input() resizable: boolean = true;
  @Input() reorderable: boolean = true;
  @Input() minResizableWidth: number = 10;
  @Input() title: string;
  @Input() locked: boolean;
  @Input() hidden: boolean;
  @Input() media: string;
  @Input() style: {
    [key: string]: string;
  };
  @Input() headerStyle: {
    [key: string]: string;
  };
  @Input() footerStyle: {
    [key: string]: string;
  };
  @Input('class') cssClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  };
  @Input()
  headerClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  };
  @Input()
  footerClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  };
  @ContentChildren(HeaderTemplateDirective, {descendants: false})
  headerTemplates: QueryList<HeaderTemplateDirective> = new QueryList<HeaderTemplateDirective>();
  @ContentChildren(FooterTemplateDirective)
  footerTemplate: FooterTemplateDirective;

  constructor(public parent?: ColumnBase) {
    if (parent && !isColumnContainer(parent)) {
      throw new Error('Columns can be nested only inside ColumnGroupComponent');
    }
  }

  @Input()
  width: number;

  @Input()
  minWidth: number;

  @Input()
  maxWidth: number;

  get level() {
    if (this.parent && isSpanColumn(this.parent)) {
      return this.parent.level;
    }
    return this.parent ? this.parent.level + 1 : 0;
  }

  get isLocked() {
    return this.parent ? this.parent.isLocked : this.locked;
  }

  get colspan() {
    return 1;
  }

  get headerTemplateRef(): TemplateRef<any> {
    const template = this.headerTemplates.first;
    return template ? template.templateRef : undefined;
  }

  get footerTemplateRef(): TemplateRef<any> {
    return this.footerTemplate ? this.footerTemplate.templateRef : undefined;
  }

  get displayTitle() {
    return this.title;
  }

  get isVisible(): boolean {
    return !this.hidden && this.matchesMedia;
  }

  rowspan(totalColumnLevels: number): number {
    return this.level < totalColumnLevels ? totalColumnLevels - this.level + 1 : 1;
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ContentChildren, Host, Optional, QueryList, SkipSelf } from '@angular/core';
import { columnsSpan } from '../helper/column-common';
import { AutoGenerateColumnPositon, ColumnBase } from './column-base';

export function isColumnGroupComponent(column) {
  return column.isColumnGroup;
}

@Component({
  providers: [
    {
      provide    : ColumnBase,
      useExisting: ColumnGroupComponent
    }
  ],
  selector : 'tri-data-table-column-group',
  template : ''
})
export class ColumnGroupComponent extends ColumnBase {
  autoGenerateColumnPosition = 'middle' as AutoGenerateColumnPositon;

  isColumnGroup = true;
  @ContentChildren(ColumnBase) children: QueryList<ColumnBase>;

  constructor(@SkipSelf()
              @Host()
              @Optional()
              public parent?: ColumnBase) {
    super(parent);
    if (parent && (<any>parent).isSpanColumn) {
      throw new Error('ColumnGroupComponent cannot be nested inside SpanColumnComponent');
    }
  }

  get colspan(): number {
    if (!this.children || this.children.length === 1) {
      return 1;
    }
    return columnsSpan(this.children.filter(child => child !== this && !child.hidden));
  }

  rowspan() {
    return 1;
  }
}

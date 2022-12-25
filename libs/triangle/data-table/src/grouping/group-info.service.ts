/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { GroupDescriptor } from '@gradii/triangle/data-query';
import { ColumnList } from '../columns/column-list';
import { ColumnComponent, isColumnComponent } from '../columns/column.component';
import { expandColumns } from '../helper/column-common';
import { GroupRow } from '../row-column/group-row';

export class GroupInfoService {
  private _columnList;

  constructor() {
    this._columnList = ColumnList.empty;
  }

  get columns(): ColumnComponent[] {
    return <ColumnComponent[]>expandColumns(this._columnList().toArray()).filter(isColumnComponent);
  }

  registerColumnsContainer(columns: () => ColumnList): void {
    this._columnList = columns;
  }

  formatForGroup(item: GroupRow | GroupDescriptor): string {
    const column = this.columnForGroup(item);
    return column ? column.format : '';
  }

  isGroupable(groupField: string): boolean {
    const [column] = this.columns.filter(x => x.field === groupField);

    return column ? column.groupable : true;
  }

  groupTitle(item: GroupRow | GroupDescriptor): string {
    const column = this.columnForGroup(item);
    return column ? column.title || column.field : this.groupField(item);
  }

  groupHeaderTemplate(item: GroupRow | GroupDescriptor): any {
    const column = this.columnForGroup(item);
    return column ? column.groupHeaderTemplateRef : undefined;
  }

  private groupField(group: GroupRow | GroupDescriptor) {
    return group.field;
  }

  private columnForGroup(group: GroupRow | GroupDescriptor) {
    const field = this.groupField(group);
    const column = this.columns.filter(x => x.field === field)[0];
    return column;
  }
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { QueryList } from '@angular/core';
import { orderBy } from '@gradii/triangle/data-query';
import { ColumnComponent } from '../columns/column.component';
import { isNullOrEmptyString, isTruthy } from '@gradii/triangle/util';
import { ColumnBase } from '../columns/column-base';
import { isSpanColumnComponent } from '../columns/span-column.component';

export const expandColumns = (columns: QueryList<ColumnComponent | ColumnBase> | Array<ColumnComponent | ColumnBase>): Array<ColumnBase> => (
  columns.reduce((acc, column) => acc.concat(
    isSpanColumnComponent(column) ? column.childColumns.toArray() : [column]
  ), []) // tslint:disable-line:align
);


export const expandColumnsWithSpan = (columns: Array<ColumnBase>): Array<ColumnBase> => (
  columns.reduce((acc, column) => acc.concat(
    isSpanColumnComponent(column) ?
      [<ColumnBase>column].concat(column.childColumns.toArray()) :
      [column]
  ), []) // tslint:disable-line:align
);


export const columnsToRender = (columns: QueryList<ColumnComponent | ColumnBase> | Array<ColumnComponent | ColumnBase>): Array<ColumnBase> => (
  expandColumns(columns).filter(x => x.isVisible)
);

const sumProp = (prop: string) => (array: Array<any> | QueryList<any>): number =>
  (array || []).reduce((prev, curr) => prev + (curr[prop] || 0), 0);


export const sumColumnWidths = sumProp('width');


export const columnsSpan = sumProp('colspan');

// tslint:disable-next-line:max-line-length
const validField = new RegExp(`^[$A-Z\_a-z][$A-Z\_a-z0-9\\.]*$`);


export const isValidFieldName = (fieldName: string) =>
  !isNullOrEmptyString(fieldName) && validField.test(fieldName) &&
  fieldName[0] !== '.' && fieldName[fieldName.length - 1] !== '.';


export const children = column => column.children.filter(child => child !== column);


export const leafColumns = columns => {
  return columns.reduce((acc, column) => {
    if (column.isColumnGroup) {
      acc = acc.concat(leafColumns(children(column)));
    } else if (column.isSpanColumn) {
      acc = acc.concat(column.childColumns.toArray());
    } else {
      acc.push(column);
    }

    return acc;
  }, []).filter(x => x.isVisible); // tslint:disable-line:align
};


export const resizableColumns = columns => columns.filter(column => isTruthy(column.resizable));


export const sortColumns = (columns: Array<ColumnBase>): Array<ColumnBase> =>
  orderBy(columns, [{field: 'orderIndex', dir: 'asc'}]);


export const isInSpanColumn = (column: ColumnBase): boolean =>
  isTruthy(column.parent) && isSpanColumnComponent(column.parent);

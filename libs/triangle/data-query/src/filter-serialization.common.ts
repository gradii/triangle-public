/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isDate, isString } from './utils';

export function wrapIf(predicate) {
  return function (str, ...args) {
    return predicate() ? '' + str[0] + args[0] + str[1] : args[0];
  };
}

export function toUTC(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function quote({value, field, ignoreCase, operator}: { value: string, field: any, ignoreCase: any, operator: any }) {
  return {
    value     : '\'' + value.replace(/'/g, '\'\'') + '\'',
    field     : field,
    ignoreCase: ignoreCase,
    operator  : operator
  };
}

export function formatDate({value, field, ignoreCase, operator}: { value: string, field: any, ignoreCase: any, operator: any }) {
  return {
    value     : JSON.stringify(toUTC(value)).replace(/"/g, ''),
    field     : field,
    ignoreCase: ignoreCase,
    operator  : operator
  };
}

export function toLower({field, value, ignoreCase, operator}) {
  return {
    field     : wrapIf(() => ignoreCase)(['tolower(', ')'], field),
    value     : value,
    ignoreCase: ignoreCase,
    operator  : operator
  };
}

export function normalizeField({value, field, ignoreCase, operator}: { value: string, field: any, ignoreCase: any, operator: any }) {
  return {
    value     : value,
    field     : field.replace(/\./g, '/'),
    ignoreCase: ignoreCase,
    operator  : operator
  };
}

export function isStringValue(x) {
  return isString(x.value);
}

export function isDateValue(x) {
  return isDate(x.value);
}

export function serializeFilters(map, join) {
  return function (filter) {
    return wrapIf(() => filter.filters.length > 1)(['(', ')'], filter.filters.map(map).join(join(filter)));
  };
}

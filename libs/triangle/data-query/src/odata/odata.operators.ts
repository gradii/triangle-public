/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNotNullOrEmptyString, isPresent } from '../utils';
import { serializeFilter } from './odata-filtering.operators';

const serializeSort = function (orderby) {
  const str = orderby
    .filter(function (sort) {
      return isPresent(sort.dir);
    })
    .map(function (sort) {
      const order = sort.field.replace(/\./g, '/');
      return sort.dir === 'desc' ? order + ' desc' : order;
    })
    .join(',');
  return str ? '$orderby=' + str : str;
};
const rules = function (key, state) {
  return {
    filter: serializeFilter(state.filter || {}),
    skip  : '$skip=' + state.pageIndex,
    sort  : serializeSort(state.sort || []),
    take  : '$top=' + state.pageSize
  }[key];
};

export function toODataString(state) {
  return Object.keys(state)
    .map(function (x) {
      return rules(x, state);
    })
    .filter(isNotNullOrEmptyString)
    .join('&');
}

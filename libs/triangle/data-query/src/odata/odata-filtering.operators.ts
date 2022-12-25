/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  formatDate,
  isDateValue,
  isStringValue,
  normalizeField,
  quote,
  serializeFilters,
  toLower
} from '../filter-serialization.common';
import { isCompositeFilterDescriptor } from '../filtering/filter-descriptor.interface';
import { compose, either } from '../funcs';

const fnFormatter = function (operator) {
  return function (_a) {
    const field = _a.field,
          value = _a.value;
    return operator + '(' + field + ',' + value + ')';
  };
};
const singleOperatorFormatter = function (operator) {
  return function ({field, value}) {
    return field + ' ' + operator + ' ' + value;
  };
};
const stringFormat = function (formatter) {
  return compose(formatter, quote, toLower, normalizeField);
};
const stringFnOperator = function (operator) {
  return stringFormat(fnFormatter(operator));
};
const stringOperator = function (operator) {
  return stringFormat(singleOperatorFormatter(operator));
};
const numericOperator = function (operator) {
  return compose(singleOperatorFormatter(operator), normalizeField);
};
const dateOperator = function (operator) {
  return compose(singleOperatorFormatter(operator), normalizeField, formatDate);
};
const ifDate = function (operator) {
  return either(isDateValue, dateOperator(operator), numericOperator(operator));
};
const typedOperator = function (operator) {
  return either(isStringValue, stringOperator(operator), ifDate(operator));
};
const appendEqual = function (str) {
  return str + ' eq -1';
};
const filterOperators = {
  contains: stringFnOperator('contains'),
  doesnotcontain: compose(appendEqual, stringFnOperator('indexof')),
  endswith: stringFnOperator('endswith'),
  eq: typedOperator('eq'),
  gt: typedOperator('gt'),
  gte: typedOperator('ge'),
  isempty: function ({field}) {
    return field + ' eq \'\'';
  },
  isnotempty: function ({field}) {
    return field + ' ne \'\'';
  },
  isnotnull: function ({field}) {
    return field + ' ne null';
  },
  isnull: function ({field}) {
    return field + ' eq null';
  },
  lt: typedOperator('lt'),
  lte: typedOperator('le'),
  neq: typedOperator('ne'),
  startswith: stringFnOperator('startswith')
};
const join = function (x) {
  return ' ' + x.logic + ' ';
};
const serialize = function (x) {
  return filterOperators[x.operator](x);
};
const serializeAll = serializeFilters(function (filter) {
  return either(isCompositeFilterDescriptor, serializeAll, serialize)(filter);
}, join);

export function serializeFilter(filter) {
  if (filter.filters && filter.filters.length) {
    return '$filter=' + serializeAll(filter);
  }
  return '';
}

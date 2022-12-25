/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { getter } from './accessor';
import { isDate, isNumeric, isPresent } from './utils';

export interface AggregateResult {
  [fieldName: string]: {
    count?: number;
    sum?: number;
    average?: number;
    min?: number;
    max?: number;
  };
}

const valueToString = function (value: any) {
  value = isPresent(value) && value.getTime ? value.getTime() : value;
  return value + '';
};

export function groupCombinator(field: string): any {
  const prop   = getter(field, true);
  let position = 0;
  return function (agg: Record<string, any>, value: any) {
    agg[field]       = agg[field] || {};
    const groupValue = prop(value);
    const key        = valueToString(groupValue);
    const values     = agg[field][key] || {
      __position: position++,
      aggregates: {},
      items     : [],
      value     : groupValue
    };
    values.items.push(value);
    agg[field][key] = values;
    return agg;
  };
}

export function expandAggregates(result: any) {
  if (result === void 0) {
    result = {};
  }
  Object.keys(result).forEach(function (field) {
    const aggregates = result[field];
    Object.keys(aggregates).forEach(function (aggregate) {
      aggregates[aggregate] = aggregates[aggregate].result();
    });
  });
  return result;
}

function aggregatesFuncs(name: string): any {
  return {
    average: function () {
      let value = 0;
      let count = 0;
      return {
        calc  : function (curr: number) {
          if (isNumeric(curr)) {
            value += curr;
            count++;
          } else {
            value = curr;
          }
        },
        result: function () {
          return isNumeric(value) ? value / count : value;
        }
      };
    },
    count  : function () {
      let state = 0;
      return {
        calc  : function () {
          return state++;
        },
        result: function () {
          return state;
        }
      };
    },
    max    : function () {
      let state = Number.NEGATIVE_INFINITY;
      return {
        calc  : function (value: any) {
          state = isNumeric(state) || isDate(state) ? state : value;
          if (state < value && (isNumeric(value) || isDate(value))) {
            state = value;
          }
        },
        result: function () {
          return state;
        }
      };
    },
    min    : function () {
      let state = Number.POSITIVE_INFINITY;
      return {
        calc  : function (value: any) {
          state = isNumeric(state) || isDate(state) ? state : value;
          if (state > value && (isNumeric(value) || isDate(value))) {
            state = value;
          }
        },
        result: function () {
          return state;
        }
      };
    },
    sum    : function () {
      let state = 0;
      return {
        calc  : function (value: number) {
          return (state += value);
        },
        result: function () {
          return state;
        }
      };
    }
  }[name as 'average' | 'count' | 'max' | 'min' | 'sum']();
}

export function aggregatesCombinator(descriptors: any[]) {
  const functions = descriptors.map(function (descriptor) {
    const fieldAccessor     = getter(descriptor.field, true);
    const aggregateName     = (descriptor.aggregate || '').toLowerCase();
    const aggregateAccessor = getter(aggregateName, true);
    return function (state: any, value: any) {
      const fieldAggregates   = fieldAccessor(state) || {};
      const aggregateFunction = aggregateAccessor(fieldAggregates) || aggregatesFuncs(
        aggregateName);
      aggregateFunction.calc(fieldAccessor(value));
      fieldAggregates[descriptor.aggregate] = aggregateFunction;
      state[descriptor.field]               = fieldAggregates;
      return state;
    };
  });
  return function (state: any, value: any) {
    return functions.reduce(function (agg, calc) {
      return calc(agg, value);
    }, state);
  };
}

export function concat(arr: any[], value: any) {
  arr.push(value);
  return arr;
}

export function map(transform: any) {
  return function (reduce: any) {
    return function (acc: any, curr: any, index: number) {
      return reduce(acc, transform(curr, index));
    };
  };
}

export function filter(predicate: any) {
  return function (reduce: any) {
    return function (acc: any, curr: any) {
      return predicate(curr) ? reduce(acc, curr) : acc;
    };
  };
}

export function isTransformerResult(source: any) {
  return isPresent(source.__value);
}

function reduced(x: any) {
  if (isTransformerResult(x)) {
    return x;
  }
  return {
    __value: x,
    reduced: true
  };
}

export function take(count: number) {
  return function (reduce: (...args: any[]) => any) {
    return function (acc: any, curr: number) {
      return count-- > 0 ? reduce(acc, curr) : reduced(acc);
    };
  };
}

export function takeWhile(predicate: any) {
  return function (reduce: any) {
    return function (acc: any, curr: any) {
      return predicate(curr) ? reduce(acc, curr) : reduced(acc);
    };
  };
}

export function skip(count: number) {
  return function (reduce: (...args: any[]) => any) {
    return function (acc: number, curr: number) {
      return count-- <= 0 ? reduce(acc, curr) : acc;
    };
  };
}

export function exec(transform: any, initialValue: any, data: any) {
  let result = initialValue;
  for (let idx = 0, length_1 = data.length; idx < length_1; idx++) {
    result = transform(result, data[idx], idx);
    if (isTransformerResult(result)) {
      result = result.__value;
      break;
    }
  }
  return result;
}

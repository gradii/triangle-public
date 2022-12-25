/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { getter } from './accessor';
import { compileFilter } from './filtering/filter-expression.factory';
import { normalizeFilters } from './filtering/filter.operators';
import { compose } from './funcs';
import { groupBy, normalizeGroups } from './grouping/group.operators';
import { sort } from './sorting/sort';
import { composeSortDescriptors } from './sorting/sort-array.operator';
import { concat, exec, filter, skip, take } from './transducers';
import { isPresent, isString } from './utils';

export function orderBy(data, descriptors) {
  if (
    descriptors.some(function (x) {
      return isPresent(x.dir);
    })
  ) {
    data = data.slice(0);
    const comparer = composeSortDescriptors(descriptors);
    sort(data, 0, data.length, comparer);
  }
  return data;
}

const defaultComparer = function (a, b) {
  return a === b;
};
const normalizeComparer = function (comparer) {
  if (isString(comparer)) {
    const accessor_1 = getter(comparer);
    comparer = function (a, b) {
      return accessor_1(a) === accessor_1(b);
    };
  }
  return comparer;
};
const _distinct = function (data, comparer) {
  return data.filter(function (x, idx, xs) {
    return xs.findIndex(comparer.bind(null, x)) === idx;
  });
};

export function distinct(data, comparer) {
  if (comparer === void 0) {
    comparer = defaultComparer;
  }
  return _distinct(data, normalizeComparer(comparer));
}

export function count(data, predicate) {
  let counter = 0;
  for (let idx = 0, length_1 = data.length; idx < length_1; idx++) {
    if (predicate(data[idx])) {
      counter++;
    }
  }
  return counter;
}

export function limit(data, predicate) {
  if (predicate) {
    return data.filter(predicate);
  }
  return data;
}

export function process(data, state) {
  const skipCount        = state.pageIndex,
        takeCount        = state.pageSize,
        filterDescriptor = state.filter,
        sort             = state.sort,
        group            = state.group;
  const sortDescriptors = normalizeGroups(group || []).concat(sort || []);
  if (sortDescriptors.length) {
    data = orderBy(data, sortDescriptors);
  }
  const hasFilters = isPresent(filterDescriptor) && filter.length;
  const hasGroups = isPresent(group) && group.length;
  if (!hasFilters && !hasGroups) {
    return {
      data : takeCount ? data.slice(skipCount, skipCount + takeCount) : data,
      total: data.length
    };
  }
  let total;
  const transformers = [];
  let predicate;
  if (hasFilters) {
    predicate = compileFilter(normalizeFilters(filterDescriptor));
    total = count(data, predicate);
    transformers.push(filter(predicate));
  } else {
    total = data.length;
  }
  if (isPresent(skipCount) && isPresent(takeCount)) {
    transformers.push(skip(skipCount));
    transformers.push(take(takeCount));
  }
  if (transformers.length) {
    const transform = compose.apply(void 0, transformers);
    const result = hasGroups
      ? groupBy(data, group, transform, limit(data, predicate))
      : exec(transform(concat), [], data);
    return {data: result, total: total};
  }
  return {
    data : hasGroups ? groupBy(data, group) : data,
    total: total
  };
}

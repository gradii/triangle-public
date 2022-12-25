/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Reducer } from '../common.interfaces';
import { filterBy } from '../filtering/filter-expression.factory';
import { exec, groupCombinator, map } from '../transducers';
import { isArray, isPresent } from '../utils';
import { aggregateBy } from './aggregate.operators';
import { GroupDescriptor, GroupResult } from './group-descriptor.interface';

export function normalizeGroups(descriptors) {
  descriptors = isArray(descriptors) ? descriptors : [descriptors];
  return descriptors.map(function (x) {
    return Object.assign({dir: 'asc'}, x);
  });
}

const identity = map(function (x) {
  return x;
});

export function groupBy<T>(data: T[],
                           descriptors?: GroupDescriptor[],
                           transformers?: Reducer,
                           originalData?: T[]): GroupResult[] | T[] {
  if (descriptors === void 0) {
    descriptors = [];
  }
  if (transformers === void 0) {
    transformers = identity;
  }
  if (originalData === void 0) {
    originalData = data;
  }
  descriptors = normalizeGroups(descriptors);
  if (!descriptors.length) {
    return data;
  }
  const descriptor    = descriptors[0];
  const initialValue  = {};
  const view          = exec(transformers(
      groupCombinator(descriptor.field)),
    initialValue, data);
  const result: any[] = [];
  Object.keys(view).forEach(function (field) {
    Object.keys(view[field]).forEach(function (value) {
      const group         = view[field][value];
      let aggregateResult = {};
      let filteredData    = originalData;
      if (isPresent(descriptor.aggregates)) {
        filteredData    = filterBy(originalData, {
          field     : descriptor.field,
          ignoreCase: false,
          operator  : 'eq',
          value     : group.value
        });
        aggregateResult = aggregateBy(filteredData, descriptor.aggregates);
      }
      result[group.__position] = {
        aggregates: aggregateResult,
        field     : field,
        items     :
          descriptors.length > 1 ? groupBy(group.items, descriptors.slice(1), identity,
            filteredData) : group.items,
        value     : group.value
      };
    });
  });
  return result;
}

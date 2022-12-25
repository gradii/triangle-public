/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { getter } from '../accessor';
import { isBlank, isPresent } from '../utils';

export type Comparer = <T>(a: T, b: T) => number;
const compare: Comparer = (a: any, b: any) => {
  if (isBlank(a)) {
    return a === b ? 0 : -1;
  }
  if (isBlank(b)) {
    return 1;
  }
  if (a.localeCompare) {
    return a.localeCompare(b);
  }
  return a > b ? 1 : a < b ? -1 : 0;
};
const compareDesc: Comparer = function (a, b) {
  return compare(b, a);
};
const descriptorAsFunc = function (descriptor) {
  const prop = getter(descriptor.field, true);
  return function (a, b) {
    return (descriptor.dir === 'asc' ? compare : compareDesc)(prop(a), prop(b));
  };
};
const initial = function (_a, _b) {
  return 0;
};

export function composeSortDescriptors(descriptors) {
  return descriptors
    .filter(function (x) {
      return isPresent(x.dir);
    })
    .map(function (descriptor) {
      return descriptorAsFunc(descriptor);
    })
    .reduce(function (acc, curr) {
      return function (a, b) {
        return acc(a, b) || curr(a, b);
      };
    }, initial);
}

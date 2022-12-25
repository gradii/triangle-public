/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export function either(predicate, right, left) {
  return function (value) {
    return predicate(value) ? right(value) : left(value);
  };
}

export function compose(...args) {
  return function (data) {
    return args.reduceRight(function (acc, curr) {
      return curr(acc);
    }, data);
  };
}

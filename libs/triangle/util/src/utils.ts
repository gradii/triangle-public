/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from './is-type';

export function loop() {
}


export function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || !objA || typeof objB !== 'object' || !objB) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  // tslint:disable-next-line:prefer-for-of
  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx];
    if (!bHasOwnProperty(key)) {
      return false;
    }
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}


export function stringifyQueryParams(params: any, withPrefix = true) {
  if (isPresent(params)) {
    const rest = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
    return `${withPrefix && rest.length > 0 ? '?' : ''}${rest}`;
  } else {
    return '';
  }
}

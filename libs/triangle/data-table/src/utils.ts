/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken, QueryList } from '@angular/core';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { from, Observable } from 'rxjs';
import { merge } from 'rxjs/operators';

// export const isPresent                     = (value: any): boolean => value !== null && value !== undefined;
// export const isBlank: Function             = value => value === null || value === undefined;
// export const isArray: Function             = value => Array.isArray(value);
// export const isTruthy: Function            = value => !!value;
// export const isNullOrEmptyString: Function = value => isBlank(value) || value.trim().length === 0;
export const isChanged = (propertyName: string, changes: any, skipFirstChange: boolean = true) =>
  changes[propertyName] &&
  (!changes[propertyName].isFirstChange() || !skipFirstChange) &&
  changes[propertyName].previousValue !== changes[propertyName].currentValue;
export const anyChanged = (propertyNames: string[], changes: any, skipFirstChange: boolean = true) =>
  propertyNames.some(name => isChanged(name, changes, skipFirstChange));
export const observe = (list: QueryList<any>): Observable<any> => from([list]).pipe(merge(list.changes));
export const isUniversal = () => typeof document === 'undefined';
export const extractFormat = (format: any) => {
  if (!isNullOrEmptyString(format) && format.startsWith('{0:')) {
    return format.slice(3, format.length - 1);
  }
  return format;
};


export const not = (fn: (...x: any[]) => boolean) => (...args: any[]): boolean => !fn.apply(null, args);

export type Condition<T> = (x: T) => boolean;

export const or = <T>(...conditions: Condition<T>[]) => (value: T): boolean => conditions.reduce((acc: boolean, x) => acc || x(value), false);

export const and = <T>(...conditions: Condition<T>[]) => (value: T): boolean => conditions.reduce((acc: boolean, x) => acc && x(value), true);

export const Skip = new InjectionToken('Skip'); // tslint:disable-line:variable-name

export const guid = () => {
  let id = '';
  let i;
  let random;

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0; // tslint:disable-line:no-bitwise

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      id += '-';
    }
    // tslint:disable-next-line:no-bitwise
    id += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return id;
};

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TemplateRef, Type } from '@angular/core';
import { isObservable as _isObservable } from 'rxjs';

export function isPresent(value: any) {
  return value !== null && value !== undefined;
}

export function isBlank(value: any) {
  return value === null || value === undefined;
}

export function isNumber(value: any) {
  return typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
}

export function isArray(value: any): value is Array<any> {
  return Array.isArray(value);
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isObject(item: any) {
  return item !== null && typeof item === 'object' && Object.prototype.toString.call(item) === '[object Object]';
}

export function isRegex(value: any) {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

export function isTruthy(value: any) {
  return !!value;
}

export function isNullOrEmptyString(value: any) {
  return isBlank(value) || (isString(value) && value.trim().length === 0);
}

export function isNotNullOrEmptyString(value: any) {
  return !isNullOrEmptyString(value);
}

export function isNumeric(value: any) {
  return !isNaN(value - parseFloat(value));
}

export function isDate(value: any) {
  return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Date]';
}

export function isMap(item: any): boolean {
  return typeof item === 'object' && Object.prototype.toString.call(item) === '[object Map]';
}

export function isSet(item: any): boolean {
  return typeof item === 'object' && Object.prototype.toString.call(item) === '[object Set]';
}

export function isSymbol(item: any): boolean {
  return typeof item === 'symbol';
}

export function isBoolean(value: any): value is boolean {
  return value === true || value === false;
}

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

export const isObservable = _isObservable;

export function isInfinite(result: any) {
  return result === Number.POSITIVE_INFINITY || result === Number.NEGATIVE_INFINITY;
}

export function isEquivalent(a: any, b: any) {
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

export function isNonEmptyString(value: any): boolean { // tslint:disable-line:no-any
  return typeof value === 'string' && value !== '';
}

export function isTemplateRef(value: any): value is TemplateRef<any> { // tslint:disable-line:no-any
  return value instanceof TemplateRef;
}

export function isComponent(value: any): boolean { // tslint:disable-line:no-any
  return value instanceof Type;
}

export function isAnyEmpty(value: any): boolean {
  if (isBlank(value)) {
    return true;
  }
  if (isString(value) || isArray(value)) {
    return !value.length;
  }
  if (isMap(value) || isSet(value)) {
    return !value.size;
  }
  if (isObject(value)) {
    return !Object.keys(value).length;
  }
  if (isDate(value)) {
    return false;
  }
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

export function isIterable(x: any) {
  if (isArray(x)) {
    return true;
  }
  return isObject(x) && isFunction(x[Symbol.iterator]);
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export function isPresent(value: any) {
  return value !== null && value !== undefined;
}

export function isBlank(value: any) {
  return value === null || value === undefined;
}

export function isArray(value: any) {
  return Array.isArray(value);
}

export function isFunction(value: any) {
  return typeof value === 'function';
}

export function isString(value: any) {
  return typeof value === 'string';
}

export function isTruthy(value: any) {
  return !!value;
}

export function isNullOrEmptyString(value: any) {
  return isBlank(value) || value.trim().length === 0;
}

export function isNotNullOrEmptyString(value: any) {
  return !isNullOrEmptyString(value);
}

export function isNumeric(value: any) {
  return !isNaN(value - parseFloat(value));
}

export function isDate(value: any) {
  return value && value.getTime;
}

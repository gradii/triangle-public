/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export function coerceToString(value: string | number): string {
  return `${value || ''}`;
}

export function coerceToNumber(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value;
}

export function coerceToBoolean(value: any) {
  return !!value;
}

export function coerceToArray<T>(value: T | T[]): T[] {
  let ret: T[];
  if (value == null) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value];
  } else {
    ret = value;
  }
  return ret;
}

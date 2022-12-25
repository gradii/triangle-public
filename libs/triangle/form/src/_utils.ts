/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export function tolerantClamp(value: number, min: number, max: number) {
  if (value == undefined) {
    return value;
  }
  if (min != undefined) {
    value = Math.max(value, min);
  }
  if (max != undefined) {
    value = Math.min(value, max);
  }

  return value;
}

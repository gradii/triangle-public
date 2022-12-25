/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * @deprecated
 * @param type
 * @param namespace
 */
export function toUniqueType(type: string, namespace: string) {
  if(!namespace) {
    return `_:${type}`;
  }
  return `${namespace}:${type}`;
}

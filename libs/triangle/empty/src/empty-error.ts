/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// tslint:disable-next-line:no-any
export function getEmptyContentTypeError(content: any): Error {
  return TypeError(`useDefaultContent expect 'string', 'templateRef' or 'component' but get ${content}`);
}

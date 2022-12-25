/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';

/**
 * Throws an exception when two TriDrawer are matching the same position.
 * @docs-private
 */
export function throwDuplicatedDrawerError(position: string) {
  throw Error(`A drawer was already declared for 'position="${position}"'`);
}

/** Configures whether drawers should use auto sizing by default. */
export const TRI_DRAWER_DEFAULT_AUTOSIZE =
  new InjectionToken<boolean>('TRI_DRAWER_DEFAULT_AUTOSIZE', {
    providedIn: 'root',
    factory   : TRI_DRAWER_DEFAULT_AUTOSIZE_FACTORY,
  });


/**
 * Used to provide a drawer container to a drawer while avoiding circular references.
 * @docs-private
 */
export const TRI_DRAWER_CONTAINER = new InjectionToken('TRI_DRAWER_CONTAINER');

/** @docs-private */
export function TRI_DRAWER_DEFAULT_AUTOSIZE_FACTORY(): boolean {
  return false;
}

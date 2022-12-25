/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, InjectionToken } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriSuffix`. It serves as
 * alternative token to the actual `TriSuffix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_SUFFIX = new InjectionToken<TriSuffix>('TriSuffix');

/** Suffix to be placed at the end of the form field. */
@Directive({
  selector : '[triSuffix]',
  providers: [{provide: TRI_SUFFIX, useExisting: TriSuffix}],
})
export class TriSuffix {
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, InjectionToken } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriPrefix`. It serves as
 * alternative token to the actual `TriPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_PREFIX = new InjectionToken<TriPrefix>('TriPrefix');

/** Prefix to be placed in front of the form field. */
@Directive({
  selector : '[triPrefix]',
  providers: [{provide: TRI_PREFIX, useExisting: TriPrefix}],
})
export class TriPrefix {
}

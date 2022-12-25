/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, InjectionToken } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriSelectTrigger`. It serves as
 * alternative token to the actual `TriSelectTrigger` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_SELECT_TRIGGER = new InjectionToken<TriSelectTrigger>('TriSelectTrigger');

/**
 * Allows the user to customize the trigger that is displayed when the select has a value.
 */
@Directive({
  selector : 'tri-select-trigger',
  providers: [{provide: TRI_SELECT_TRIGGER, useExisting: TriSelectTrigger}],
})
export class TriSelectTrigger {
}

/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef } from '@angular/core';

/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
  selector: '[triAutocompleteOrigin]',
  exportAs: 'triAutocompleteOrigin',
})
export class AutocompleteOrigin {
  constructor(
    /** Reference to the element on which the directive is applied. */
    public elementRef: ElementRef<HTMLElement>
  ) {
  }
}

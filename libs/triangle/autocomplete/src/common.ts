/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

/**
 * The following style constants are necessary to save here in order
 * to properly calculate the scrollTop of the panel. Because we are not
 * actually focusing the active item, scroll must be handled manually.
 */


/** The height of each autocomplete option. */
export const AUTOCOMPLETE_OPTION_HEIGHT = 32;

/** The total height of the autocomplete panel. */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const TRI_AUTOCOMPLETE_SCROLL_STRATEGY =
  new InjectionToken<() => ScrollStrategy>('tri-autocomplete-scroll-strategy');

/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @docs-private
 */
export function getTriAutocompleteMissingPanelError(): Error {
  return Error('Attempting to open an undefined instance of `tri-autocomplete`. ' +
    'Make sure that the id passed to the `triAutocomplete` is correct and that ' +
    'you\'re attempting to open it after the ngAfterContentInit hook.');
}


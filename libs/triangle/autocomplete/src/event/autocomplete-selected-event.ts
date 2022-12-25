/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriOption as OptionComponent } from '@gradii/triangle/core';
import { TriAutocomplete } from '../autocomplete.component';

/** Event object that is emitted when an autocomplete option is selected. */
export class TriAutocompleteSelectedEvent {
  constructor(
    /** Reference to the autocomplete panel that emitted the event. */
    public source: TriAutocomplete,
    /** Option that was selected. */
    public option: OptionComponent) {
  }
}

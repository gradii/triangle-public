/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Overlay, OverlayModule, ScrollStrategy } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriOptionModule } from '@gradii/triangle/core';
import { AutocompleteOrigin } from './autocomplete-origin';
import { AutocompleteTrigger } from './autocomplete-trigger';
import { TriAutocomplete } from './autocomplete.component';
import { TRI_AUTOCOMPLETE_SCROLL_STRATEGY } from './common';


/**
 * <!-- example(autocomplete:autocomplete-basic-example) -->
 */
@NgModule({
  imports     : [OverlayModule, CommonModule, TriOptionModule],
  exports     : [
    TriAutocomplete,
    AutocompleteTrigger,
    AutocompleteOrigin,
    TriOptionModule
  ],
  declarations: [
    TriAutocomplete,
    AutocompleteTrigger,
    AutocompleteOrigin
  ],
  providers   : [{
    provide   : TRI_AUTOCOMPLETE_SCROLL_STRATEGY,
    deps      : [Overlay],
    useFactory: function (overlay: Overlay): () => ScrollStrategy {
      return () => overlay.scrollStrategies.reposition();
    },
  }],
})
export class TriAutocompleteModule {
}

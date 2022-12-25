/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { FilterInputDirective } from '../../filtering/filter-input.directive';

@NgModule({
  declarations: [
    FilterInputDirective
  ],
  exports     : [
    FilterInputDirective
  ]
})
export class FilterSharedModule {
}

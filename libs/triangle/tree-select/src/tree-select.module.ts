/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriComboboxModule } from '@gradii/triangle/combobox';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriIconModule } from '@gradii/triangle/icon';

/**
 * <!-- example(tree-select:tree-select-basic-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,

    FormsModule,
    OverlayModule,
    TriIconModule,
    OverlayModule,
    TriCommonModule,

    TriComboboxModule
  ],
  declarations: [],
  exports     : []
})
export class TriTreeSelectModule {

}
